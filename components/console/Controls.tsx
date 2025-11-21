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
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        {/* Play/Pause */}
        <button
          onClick={onPlayPause}
          className="btn-primary px-6 py-2 flex items-center gap-2"
        >
          {isRunning ? (
            <>
              <span>⏸</span>
              <span>Pause</span>
            </>
          ) : (
            <>
              <span>▶</span>
              <span>Play</span>
            </>
          )}
        </button>

        {/* Step */}
        <button onClick={onStep} className="btn-secondary px-6 py-2 flex items-center gap-2">
          <span>⏭</span>
          <span>Step (10s)</span>
        </button>
      </div>

      {/* Speed Control */}
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-400">Simulation Speed:</span>
        <div className="flex gap-2">
          {([1, 2, 5, 10] as const).map((s) => (
            <button
              key={s}
              onClick={() => onSpeedChange(s)}
              className={`px-4 py-2 rounded font-mono text-sm ${
                speed === s
                  ? 'bg-blue-600 text-white'
                  : 'bg-ops-panel-light text-gray-400 hover:bg-ops-panel'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="text-sm text-gray-400">
        Press <kbd className="px-2 py-1 bg-ops-panel-light rounded">Space</kbd> to play/pause
      </div>
    </div>
  );
}
