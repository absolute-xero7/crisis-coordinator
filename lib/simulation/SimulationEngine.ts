// Core Simulation Engine
// Manages simulation state and coordinates all systems

import {
  SimulationState,
  ScenarioDefinition,
  Incident,
  Resource,
  SimulationEvent,
  ResourceStatus,
  IncidentStatus,
} from '../types';
import { initializeSimulationState } from './SimulationState';
import { moveToward, positionsEqual } from '../utils/mapUtils';
import { formatTime } from '../utils/timeUtils';

export class SimulationEngine {
  private state: SimulationState;
  private eventIdCounter: number = 0;

  constructor(scenario: ScenarioDefinition) {
    this.state = initializeSimulationState(scenario);
  }

  /**
   * Get current simulation state
   */
  getState(): SimulationState {
    return { ...this.state };
  }

  /**
   * Set simulation state (for loading saved states)
   */
  setState(state: SimulationState): void {
    this.state = state;
  }

  /**
   * Advance simulation by one step (10 seconds)
   */
  async step(): Promise<SimulationState> {
    // Increment timeline (10 seconds per step)
    this.state.timeline += 10;

    // 1. Check for scripted events
    this.processScriptedEvents();

    // 2. Update resource positions (moving toward incidents)
    this.updateResourcePositions();

    // 3. Check for arrivals
    this.processArrivals();

    // 4. Update incident states (based on resources on-scene)
    this.updateIncidentStates();

    // 5. Process transports (ambulances to hospitals)
    this.processTransports();

    // 6. Update hospital capacities
    this.updateHospitalCapacities();

    // 7. Update statistics
    this.updateStats();

    // 8. Agent decisions will be triggered separately via API
    // (This keeps LLM calls out of the core loop)

    return this.getState();
  }

  /**
   * Check and process scripted events
   */
  private processScriptedEvents(): void {
    const { scenario, timeline } = this.state;

    for (const scriptedEvent of scenario.scriptedEvents) {
      // Check if event should trigger now
      if (scriptedEvent.triggerTime === timeline) {
        this.handleScriptedEvent(scriptedEvent);
      }
    }
  }

  /**
   * Handle a scripted event
   */
  private handleScriptedEvent(scriptedEvent: any): void {
    switch (scriptedEvent.type) {
      case 'spawn_incident':
        this.spawnIncident(scriptedEvent.payload);
        break;
      case 'hospital_capacity':
        this.updateHospitalCapacity(scriptedEvent.payload);
        break;
      case 'weather':
        this.logEvent({
          type: 'alert',
          description: `Weather update: ${scriptedEvent.payload.description}`,
          severity: 3,
        });
        break;
      case 'road_closure':
        this.logEvent({
          type: 'alert',
          description: `Road closure: ${scriptedEvent.payload.description}`,
          severity: 3,
        });
        break;
    }
  }

  /**
   * Spawn a new incident
   */
  private spawnIncident(incidentData: any): void {
    const incident: Incident = {
      id: incidentData.id || `TOR-INC-${this.state.incidents.length + 100}`,
      type: incidentData.type,
      location: incidentData.location,
      severity: incidentData.severity,
      peopleAffected: incidentData.peopleAffected,
      details: incidentData.details,
      status: 'reported',
      reportedAt: this.state.timeline,
      assignedResources: [],
      metadata: {
        casualties: 0,
        transported: 0,
        evacuated: 0,
      },
    };

    this.state.incidents.push(incident);
    this.state.stats.totalIncidents++;

    this.logEvent({
      type: 'incident',
      description: `NEW INCIDENT: ${incident.type.toUpperCase()} - ${incident.details.substring(0, 80)}`,
      severity: incident.severity,
    });
  }

  /**
   * Update resource positions (move toward assigned incidents)
   */
  private updateResourcePositions(): void {
    for (const resource of this.state.resources) {
      if (resource.status === 'en-route' && resource.assignedTo) {
        const incident = this.state.incidents.find((i) => i.id === resource.assignedTo);
        if (incident) {
          // Move toward incident
          const newPos = moveToward(resource.location, incident.location);
          resource.location = newPos;

          // Check if arrived
          if (positionsEqual(resource.location, incident.location)) {
            resource.status = 'on-scene';
            this.logEvent({
              type: 'arrival',
              description: `${resource.name} arrived at ${incident.id} (${incident.location.address || incident.location.landmark || 'scene'})`,
              severity: incident.severity,
            });
          }
        }
      } else if (resource.status === 'transporting' && resource.assignedTo) {
        // Move toward assigned hospital
        const hospital = this.state.hospitals.find((h) => h.id === resource.assignedTo);
        if (hospital) {
          const newPos = moveToward(resource.location, hospital.location);
          resource.location = newPos;

          // Check if arrived at hospital
          if (positionsEqual(resource.location, hospital.location)) {
            resource.status = 'available';
            resource.assignedTo = undefined;

            // Increase hospital utilization
            if (hospital.capacityUsed < hospital.capacityTotal) {
              hospital.capacityUsed++;
            }

            this.logEvent({
              type: 'transport',
              description: `${resource.name} delivered patient to ${hospital.name}`,
              severity: 2,
            });
          }
        }
      } else if (resource.status === 'returning') {
        // Return to station (simplified - just mark available after a few steps)
        resource.status = 'available';
      }
    }
  }

  /**
   * Process arrivals (resources reaching incidents)
   */
  private processArrivals(): void {
    // Arrivals are handled in updateResourcePositions()
    // This method can be used for additional arrival logic
  }

  /**
   * Update incident states based on resources on-scene
   */
  private updateIncidentStates(): void {
    for (const incident of this.state.incidents) {
      if (incident.status === 'resolved') continue;

      // Get resources on-scene for this incident
      const onSceneResources = this.state.resources.filter(
        (r) => r.assignedTo === incident.id && r.status === 'on-scene'
      );

      if (onSceneResources.length === 0) {
        // No resources yet
        if (incident.status === 'reported') {
          // Check if resources are en-route
          const enRouteResources = this.state.resources.filter(
            (r) => r.assignedTo === incident.id && r.status === 'en-route'
          );
          if (enRouteResources.length > 0) {
            incident.status = 'responding';
          }
        }
      } else {
        // Resources on-scene
        if (incident.status !== 'on-scene' && incident.status !== 'contained') {
          incident.status = 'on-scene';
        }

        // Check if enough resources to contain
        const requiredResources = this.getRequiredResources(incident);
        if (onSceneResources.length >= requiredResources) {
          // Calculate time to resolution based on severity
          const timeOnScene = this.state.timeline - (incident.reportedAt + 300); // Assume 5 min response time
          const resolutionTime = incident.severity * 300; // 5 minutes per severity level

          if (timeOnScene >= resolutionTime) {
            incident.status = 'contained';

            // After contained, resolve after additional time
            if (timeOnScene >= resolutionTime + 300) {
              this.resolveIncident(incident);
            }
          }
        }
      }
    }
  }

  /**
   * Get required number of resources for an incident
   */
  private getRequiredResources(incident: Incident): number {
    // Simple heuristic: severity determines resource needs
    return Math.ceil(incident.severity / 2); // 5 -> 3, 4 -> 2, 3 -> 2, 2 -> 1, 1 -> 1
  }

  /**
   * Resolve an incident
   */
  private resolveIncident(incident: Incident): void {
    incident.status = 'resolved';
    incident.resolvedAt = this.state.timeline;

    // Update stats
    this.state.stats.resolvedIncidents++;
    this.state.stats.peopleSaved += incident.peopleAffected - (incident.metadata.casualties || 0);

    // Free up assigned resources
    for (const resourceId of incident.assignedResources) {
      const resource = this.state.resources.find((r) => r.id === resourceId);
      if (resource && resource.status === 'on-scene') {
        resource.status = 'returning';
        resource.assignedTo = undefined;
      }
    }

    this.logEvent({
      type: 'resolution',
      description: `RESOLVED: ${incident.id} - ${incident.peopleAffected} people safe, ${incident.metadata.casualties || 0} casualties`,
      severity: 1,
    });
  }

  /**
   * Process ambulance transports to hospitals
   */
  private processTransports(): void {
    // Handled in updateResourcePositions()
  }

  /**
   * Update hospital capacities
   */
  private updateHospitalCapacities(): void {
    // Calculate total utilization
    const totalCapacity = this.state.hospitals.reduce((sum, h) => sum + h.capacityTotal, 0);
    const totalUsed = this.state.hospitals.reduce((sum, h) => sum + h.capacityUsed, 0);
    this.state.stats.hospitalUtilization = Math.round((totalUsed / totalCapacity) * 100);
  }

  /**
   * Update a specific hospital's capacity (scripted event)
   */
  private updateHospitalCapacity(payload: any): void {
    const hospital = this.state.hospitals.find((h) => h.id === payload.hospitalId);
    if (hospital) {
      hospital.capacityUsed = payload.capacityUsed;
      this.logEvent({
        type: 'alert',
        description: `${hospital.name}: Capacity now ${hospital.capacityUsed}/${hospital.capacityTotal} (${Math.round((hospital.capacityUsed / hospital.capacityTotal) * 100)}%)`,
        severity: hospital.capacityUsed / hospital.capacityTotal > 0.9 ? 4 : 3,
      });
    }
  }

  /**
   * Update statistics
   */
  private updateStats(): void {
    // Calculate average response time
    const resolvedIncidents = this.state.incidents.filter((i) => i.resolvedAt);
    if (resolvedIncidents.length > 0) {
      const totalResponseTime = resolvedIncidents.reduce((sum, i) => {
        const responseTime = (i.resolvedAt || 0) - i.reportedAt;
        return sum + responseTime;
      }, 0);
      this.state.stats.avgResponseTime = Math.round(
        totalResponseTime / resolvedIncidents.length / 60
      ); // Convert to minutes
    }
  }

  /**
   * Log an event
   */
  private logEvent(event: Omit<SimulationEvent, 'id' | 'timestamp'>): void {
    const fullEvent: SimulationEvent = {
      id: `evt-${this.eventIdCounter++}`,
      timestamp: this.state.timeline,
      ...event,
    };
    this.state.events.push(fullEvent);
  }

  /**
   * Assign resource to incident (called by Resource Agent)
   */
  assignResource(resourceId: string, incidentId: string): void {
    const resource = this.state.resources.find((r) => r.id === resourceId);
    const incident = this.state.incidents.find((i) => i.id === incidentId);

    if (resource && incident && resource.status === 'available') {
      resource.status = 'dispatched';
      resource.assignedTo = incidentId;
      incident.assignedResources.push(resourceId);

      // Immediately set to en-route
      setTimeout(() => {
        if (resource.status === 'dispatched') {
          resource.status = 'en-route';
        }
      }, 100);

      this.logEvent({
        type: 'decision',
        description: `${resource.name} dispatched to ${incidentId}`,
        severity: incident.severity,
        agentId: 'resource',
      });
    }
  }

  /**
   * Assign hospital for transport (called by Logistics Agent)
   */
  assignHospital(incidentId: string, hospitalId: string): void {
    const incident = this.state.incidents.find((i) => i.id === incidentId);
    const hospital = this.state.hospitals.find((h) => h.id === hospitalId);

    if (incident && hospital) {
      // Find ambulances on-scene at this incident
      const ambulances = this.state.resources.filter(
        (r) =>
          r.type === 'ambulance' &&
          r.assignedTo === incidentId &&
          r.status === 'on-scene'
      );

      if (ambulances.length > 0) {
        const ambulance = ambulances[0];
        ambulance.status = 'transporting';
        ambulance.assignedTo = hospitalId;

        this.logEvent({
          type: 'decision',
          description: `${ambulance.name} transporting patient from ${incidentId} to ${hospital.name}`,
          severity: incident.severity,
          agentId: 'logistics',
          torontoContext: `${hospital.address}, ${Math.round((hospital.capacityUsed / hospital.capacityTotal) * 100)}% capacity`,
        });
      }
    }
  }

  /**
   * Toggle pause state
   */
  togglePause(): void {
    this.state.isPaused = !this.state.isPaused;
  }

  /**
   * Set simulation speed
   */
  setSpeed(speed: 1 | 2 | 5 | 10): void {
    this.state.speed = speed;
  }

  /**
   * Check if simulation is complete
   */
  isComplete(): boolean {
    return (
      this.state.timeline >= this.state.scenario.duration * 60 ||
      this.state.incidents.every((i) => i.status === 'resolved')
    );
  }
}
