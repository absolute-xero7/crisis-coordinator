interface ControlsProps {
  isRunning: boolean;
  speed: 1 | 2 | 5 | 10;
  onPlayPause: () => void;
  onStep: () => void;
  onSpeedChange: (speed: 1 | 2 | 5 | 10) => void;
}

export default function Controls({
  isRunning,
  speed,
  onPlayPause,
  onStep,
  onSpeedChange,
}: ControlsProps) {
  return (
    <div className="flex items-center justify-between flex-wrap gap-4">
      <div className="flex items-center gap-3">
        {/* Play/Pause with Enhanced Button */}
        <button
          onClick={onPlayPause}
          className="btn-primary-enhanced px-6 py-2.5 flex items-center gap-2 group"
        >
          <span className="text-lg transition-transform group-hover:scale-110">
            {isRunning ? '⏸' : '▶'}
          </span>
          <span className="font-semibold">{isRunning ? 'Pause' : 'Play'}</span>
        </button>

        {/* Step with Enhanced Button */}
        <button 
          onClick={onStep} 
          className="btn-secondary-enhanced px-6 py-2.5 flex items-center gap-2 group"
        >
          <span className="text-lg transition-transform group-hover:translate-x-1">⏭</span>
          <span className="font-semibold">Step</span>
          <span className="text-xs opacity-60">(10s)</span>
        </button>
      </div>

      {/* Speed Control with Better Design */}
      <div className="flex items-center gap-4 px-4 py-2 bg-ops-panel-light border border-ops-border">
        <span className="text-sm text-gray-300 font-medium">Speed:</span>
        <div className="flex gap-1">
          {([1, 2, 5, 10] as const).map((s) => (
            <button
              key={s}
              onClick={() => onSpeedChange(s)}
              className={`px-3 py-1.5 font-mono text-sm transition-all duration-300 ${
                speed === s
                  ? 'bg-accent-amber text-ops-bg shadow-lg shadow-accent-amber/30 scale-110'
                  : 'bg-ops-panel text-gray-300 hover:bg-ops-panel-light hover:text-ink hover:scale-105 border border-transparent hover:border-accent-amber/30'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      {/* Info with Better Keyboard Visual */}
      <div className="text-sm text-gray-400 flex items-center gap-2">
        <span>Press</span>
        <kbd className="px-3 py-1.5 bg-ops-panel-light rounded-md border border-ops-border text-accent-amber font-mono text-xs shadow-sm">
          Space
        </kbd>
        <span>to play/pause</span>
      </div>
    </div>
  );
}
