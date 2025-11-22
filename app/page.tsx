import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-ops-bg">
      {/* Animated Background Grid */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none">
        <div className="absolute inset-0 bg-grid-pattern animate-grid-flow"></div>
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Enhanced Background gradient with radial glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-ops-bg to-ops-bg"></div>
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl"></div>

        <div className="relative max-w-7xl mx-auto px-6 py-24">
          {/* Header */}
          <div className="text-center mb-16">
            {/* System Status Badge with Animation */}
            <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-full animate-fade-in-up backdrop-blur-sm">
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse-glow"></div>
              <span className="text-blue-400 font-mono text-sm">
                Toronto Emergency Operations Centre • System Operational
              </span>
            </div>

            <h1 className="text-6xl md:text-7xl font-display font-bold mb-6 animate-fade-in-up animation-delay-100">
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-600 bg-clip-text text-transparent hover-gradient-shift">
                CrisisCoordinator
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-8 animate-fade-in-up animation-delay-200">
              Multi-Agent AI System for Emergency Response Simulation
            </p>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed animate-fade-in-up animation-delay-300">
              Built for Toronto. Demonstrating how AI can support emergency coordinators
              with transparent, explainable decisions during crisis scenarios.
            </p>

            <div className="flex gap-4 justify-center animate-fade-in-up animation-delay-400">
              <Link
                href="/console"
                className="btn-primary-enhanced text-lg px-8 py-4 inline-block group"
              >
                <span className="flex items-center gap-2">
                  Launch Operations Console
                  <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </Link>
              <Link
                href="/console/builder"
                className="btn-secondary-enhanced text-lg px-8 py-4 inline-block group"
              >
                <span className="flex items-center gap-2">
                  Scenario Builder
                  <svg className="w-5 h-5 transition-transform group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </span>
              </Link>
            </div>
          </div>

          {/* Feature Cards with Staggered Animation */}
          <div className="grid md:grid-cols-3 gap-6 mt-20">
            <div className="ops-panel p-6 hover-lift animate-fade-in-up animation-delay-500 group transition-all duration-300 hover:border-blue-500/50">
              <div className="text-3xl mb-4 transition-transform group-hover:scale-110">🧠</div>
              <h3 className="text-xl font-display font-semibold mb-2 text-blue-300">
                5 Specialized Agents
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Triage, Resource Assignment, Logistics, Medical Monitoring, and
                Communications agents work together for Toronto emergency response.
              </p>
            </div>

            <div className="ops-panel p-6 hover-lift animate-fade-in-up animation-delay-600 group transition-all duration-300 hover:border-blue-500/50">
              <div className="text-3xl mb-4 transition-transform group-hover:scale-110">🍁</div>
              <h3 className="text-xl font-display font-semibold mb-2 text-blue-300">
                Toronto-Specific
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Real Toronto hospitals, streets, TTC lines, PATH system, DVP, and
                emergency services data built-in.
              </p>
            </div>

            <div className="ops-panel p-6 hover-lift animate-fade-in-up animation-delay-700 group transition-all duration-300 hover:border-blue-500/50">
              <div className="text-3xl mb-4 transition-transform group-hover:scale-110">💡</div>
              <h3 className="text-xl font-display font-semibold mb-2 text-blue-300">
                Explainable Decisions
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Every agent decision includes detailed reasoning with Toronto context.
                Transparent AI for critical situations.
              </p>
            </div>
          </div>

          {/* Scenarios with Enhanced Cards */}
          <div className="mt-20">
            <h2 className="text-3xl font-display font-bold text-center mb-4 animate-fade-in-up animation-delay-800">
              Built-In Toronto Scenarios
            </h2>
            <p className="text-gray-400 text-center mb-12 animate-fade-in-up animation-delay-900">
              High-fidelity crisis simulations based on Toronto&rsquo;s unique infrastructure
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="ops-panel-light p-6 border-l-4 border-blue-500 hover-lift-strong animate-fade-in-up animation-delay-1000 group transition-all duration-300 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/20">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="text-lg font-semibold text-blue-300 group-hover:text-blue-200 transition-colors">
                    PATH System Flood
                  </h4>
                  <span className="text-2xl opacity-60 group-hover:opacity-100 transition-opacity">🌊</span>
                </div>
                <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                  Water main rupture floods underground PATH system. 2,000+ trapped.
                  Union Station threatened. 75 minutes.
                </p>
                <div className="flex gap-2 text-xs flex-wrap">
                  <span className="status-badge bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    Mass Evacuation
                  </span>
                  <span className="status-badge bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    Underground
                  </span>
                </div>
              </div>

              <div className="ops-panel-light p-6 border-l-4 border-amber-500 hover-lift-strong animate-fade-in-up animation-delay-1100 group transition-all duration-300 hover:border-amber-400 hover:shadow-lg hover:shadow-amber-500/20">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="text-lg font-semibold text-amber-300 group-hover:text-amber-200 transition-colors">
                    DVP Winter Blizzard
                  </h4>
                  <span className="text-2xl opacity-60 group-hover:opacity-100 transition-opacity">❄️</span>
                </div>
                <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                  40-vehicle pileup on DVP. -25°C wind chill. Hypothermia, hospital
                  overload. 90 minutes.
                </p>
                <div className="flex gap-2 text-xs flex-wrap">
                  <span className="status-badge bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    Mass Casualty
                  </span>
                  <span className="status-badge bg-red-500/20 text-red-400 border border-red-500/30">
                    Cold Weather
                  </span>
                </div>
              </div>

              <div className="ops-panel-light p-6 border-l-4 border-red-500 hover-lift-strong animate-fade-in-up animation-delay-1200 group transition-all duration-300 hover:border-red-400 hover:shadow-lg hover:shadow-red-500/20">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="text-lg font-semibold text-red-300 group-hover:text-red-200 transition-colors">
                    Billy Bishop Airport Incident
                  </h4>
                  <span className="text-2xl opacity-60 group-hover:opacity-100 transition-opacity">✈️</span>
                </div>
                <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                  Aircraft crash into Lake Ontario. Fuel fire. Waterfront evacuation.
                  Marine rescue. 60 minutes.
                </p>
                <div className="flex gap-2 text-xs flex-wrap">
                  <span className="status-badge bg-red-500/20 text-red-400 border border-red-500/30">
                    Aviation
                  </span>
                  <span className="status-badge bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    Marine
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* CTA with Enhanced Design */}
          <div className="mt-20 text-center ops-panel p-12 border-2 border-blue-500/30 hover-lift animate-fade-in-up animation-delay-1300 relative overflow-hidden group">
            {/* Animated background glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-cyan-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="relative z-10">
              <h2 className="text-3xl font-display font-bold mb-4">
                Ready to coordinate Toronto&rsquo;s emergency response?
              </h2>
              <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
                Experience multi-agent AI decision-making with full transparency.
                Watch five specialized agents work in concert to save lives.
              </p>
              <Link
                href="/console"
                className="btn-primary-enhanced text-lg px-10 py-4 inline-block group/btn"
              >
                <span className="flex items-center gap-2">
                  Start Simulation
                  <svg className="w-5 h-5 transition-transform group-hover/btn:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </span>
              </Link>
            </div>
          </div>

          {/* Footer with Better Spacing */}
          <div className="mt-16 text-center text-gray-500 text-sm space-y-2 animate-fade-in-up animation-delay-1400">
            <p className="flex items-center justify-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-blue-500/50"></span>
              Built for human-centered AI demonstration
            </p>
            <p className="text-gray-600">
              Training prototype - not for live emergency dispatch
            </p>
            <p className="text-blue-400 font-mono text-xs mt-4">
              🍁 Made for Toronto Emergency Operations Centre
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
