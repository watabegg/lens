import type { AppState, ViewMode } from "../state";
import type { LensResult } from "../physics/lens";
import FormulaView from "./FormulaView";

interface ControlPanelProps {
  state: AppState;
  lensResult: LensResult;
  onChange: (partial: Partial<AppState>) => void;
  onViewModeChange: (mode: ViewMode) => void;
  onReset: () => void;
}

interface RangeFieldProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  hint?: string;
  onChange: (value: number) => void;
}

const RangeField = ({
  label,
  value,
  min,
  max,
  step,
  unit,
  hint,
  onChange,
}: RangeFieldProps) => (
  <div className="range-field">
    <div className="range-header">
      <div>
        <div className="range-label">{label}</div>
        {hint && <div className="range-hint">{hint}</div>}
      </div>
      <div className="range-value">
        {value.toFixed(1)} {unit}
      </div>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(event) => onChange(Number(event.target.value))}
    />
  </div>
);

export default function ControlPanel({
  state,
  lensResult,
  onChange,
  onViewModeChange,
  onReset,
}: ControlPanelProps) {
  return (
    <div className="control-panel">
      <div className="mode-toggle">
        <button
          type="button"
          className={state.viewMode === "simple" ? "active" : ""}
          onClick={() => onViewModeChange("simple")}
        >
          Simple
        </button>
        <button
          type="button"
          className={state.viewMode === "detail" ? "active" : ""}
          onClick={() => onViewModeChange("detail")}
        >
          Detail
        </button>
      </div>

      <RangeField
        label="Object distance (a)"
        value={state.objectDistanceCm}
        min={5}
        max={50}
        step={0.5}
        unit="cm"
        hint="Object to lens"
        onChange={(value) => onChange({ objectDistanceCm: value })}
      />
      <RangeField
        label="Screen distance"
        value={state.screenDistanceCm}
        min={5}
        max={50}
        step={0.5}
        unit="cm"
        hint="Screen to lens"
        onChange={(value) => onChange({ screenDistanceCm: value })}
      />
      <RangeField
        label="Focal length (f)"
        value={state.focalLengthCm}
        min={5}
        max={30}
        step={0.5}
        unit="cm"
        hint="Convex lens"
        onChange={(value) => onChange({ focalLengthCm: value })}
      />

      <div className="toggle-row">
        <button
          type="button"
          className={state.showRays ? "toggle active" : "toggle"}
          onClick={() => onChange({ showRays: !state.showRays })}
        >
          {state.showRays ? "Hide rays" : "Show rays"}
        </button>
      </div>

      <FormulaView
        viewMode={state.viewMode}
        state={state}
        lensResult={lensResult}
      />

      <div className="reset-row">
        <button type="button" className="reset" onClick={onReset}>
          Reset
        </button>
      </div>
    </div>
  );
}
