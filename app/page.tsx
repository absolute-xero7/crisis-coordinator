import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-ops-bg">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-ops-bg to-ops-bg"></div>

        <div className="relative max-w-7xl mx-auto px-6 py-24">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-block mb-4 px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-full">
              <span className="text-blue-400 font-mono text-sm">
                Toronto Emergency Operations Centre
              </span>
            </div>
            <h1 className="text-6xl md:text-7xl font-display font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                CrisisCoordinator
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-8">
              Multi-Agent AI System for Emergency Response Simulation
            </p>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-12">
              Built for Toronto. Demonstrating how AI can support emergency coordinators
              with transparent, explainable decisions during crisis scenarios.
            </p>

            <div className="flex gap-4 justify-center">
              <Link
                href="/console"
                className="btn-primary text-lg px-8 py-4 inline-block"
              >
                Launch Operations Console
              </Link>
              <Link
                href="/console/builder"
                className="btn-secondary text-lg px-8 py-4 inline-block"
              >
                Scenario Builder
              </Link>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6 mt-20">
            <div className="ops-panel p-6">
              <div className="text-3xl mb-4">🧠</div>
              <h3 className="text-xl font-display font-semibold mb-2">
                5 Specialized Agents
              </h3>
              <p className="text-gray-400 text-sm">
                Triage, Resource Assignment, Logistics, Medical Monitoring, and
                Communications agents work together for Toronto emergency response.
              </p>
            </div>

            <div className="ops-panel p-6">
              <div className="text-3xl mb-4">🍁</div>
              <h3 className="text-xl font-display font-semibold mb-2">
                Toronto-Specific
              </h3>
              <p className="text-gray-400 text-sm">
                Real Toronto hospitals, streets, TTC lines, PATH system, DVP, and
                emergency services data built-in.
              </p>
            </div>

            <div className="ops-panel p-6">
              <div className="text-3xl mb-4">💡</div>
              <h3 className="text-xl font-display font-semibold mb-2">
                Explainable Decisions
              </h3>
              <p className="text-gray-400 text-sm">
                Every agent decision includes detailed reasoning with Toronto context.
                Transparent AI for critical situations.
              </p>
            </div>
          </div>

          {/* Scenarios */}
          <div className="mt-20">
            <h2 className="text-3xl font-display font-bold text-center mb-12">
              Built-In Toronto Scenarios
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="ops-panel-light p-6 border-l-4 border-blue-500">
                <h4 className="text-lg font-semibold mb-2">PATH System Flood</h4>
                <p className="text-gray-400 text-sm mb-4">
                  Water main rupture floods underground PATH system. 2,000+ trapped.
                  Union Station threatened. 75 minutes.
                </p>
                <div className="flex gap-2 text-xs">
                  <span className="status-badge bg-blue-500/20 text-blue-400">
                    Mass Evacuation
                  </span>
                  <span className="status-badge bg-amber-500/20 text-amber-400">
                    Underground
                  </span>
                </div>
              </div>

              <div className="ops-panel-light p-6 border-l-4 border-amber-500">
                <h4 className="text-lg font-semibold mb-2">DVP Winter Blizzard</h4>
                <p className="text-gray-400 text-sm mb-4">
                  40-vehicle pileup on DVP. -25°C wind chill. Hypothermia, hospital
                  overload. 90 minutes.
                </p>
                <div className="flex gap-2 text-xs">
                  <span className="status-badge bg-blue-500/20 text-blue-400">
                    Mass Casualty
                  </span>
                  <span className="status-badge bg-red-500/20 text-red-400">
                    Cold Weather
                  </span>
                </div>
              </div>

              <div className="ops-panel-light p-6 border-l-4 border-red-500">
                <h4 className="text-lg font-semibold mb-2">
                  Billy Bishop Airport Incident
                </h4>
                <p className="text-gray-400 text-sm mb-4">
                  Aircraft crash into Lake Ontario. Fuel fire. Waterfront evacuation.
                  Marine rescue. 60 minutes.
                </p>
                <div className="flex gap-2 text-xs">
                  <span className="status-badge bg-red-500/20 text-red-400">
                    Aviation
                  </span>
                  <span className="status-badge bg-blue-500/20 text-blue-400">
                    Marine
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-20 text-center ops-panel p-12 border-2 border-blue-500/30">
            <h2 className="text-3xl font-display font-bold mb-4">
              Ready to coordinate Toronto's emergency response?
            </h2>
            <p className="text-gray-400 mb-8">
              Experience multi-agent AI decision-making with full transparency
            </p>
            <Link
              href="/console"
              className="btn-primary text-lg px-10 py-4 inline-block"
            >
              Start Simulation
            </Link>
          </div>

          {/* Footer */}
          <div className="mt-16 text-center text-gray-500 text-sm">
            <p>
              Built for human-centered AI demonstration. Training prototype - not for
              live emergency dispatch.
            </p>
            <p className="mt-2">
              🍁 Made for Toronto Emergency Operations Centre
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
