import type { AppState, ViewMode } from "../state";

interface ControlPanelProps {
  state: AppState;
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

const clampNumber = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

const RangeField = ({
  label,
  value,
  min,
  max,
  step,
  unit,
  hint,
  onChange,
}: RangeFieldProps) => {
  const handleNumberChange = (raw: string) => {
    if (raw === "") return;
    const next = Number(raw);
    if (Number.isNaN(next)) return;
    onChange(clampNumber(next, min, max));
  };

  const handleNumberBlur = (raw: string) => {
    if (raw === "") {
      onChange(min);
      return;
    }
    const next = Number(raw);
    if (Number.isNaN(next)) return;
    onChange(clampNumber(next, min, max));
  };

  return (
    <div className="range-field">
      <div className="range-header">
        <div>
          <div className="range-label">{label}</div>
          {hint && <div className="range-hint">{hint}</div>}
        </div>
        <div className="range-input">
          <input
            type="number"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(event) => handleNumberChange(event.target.value)}
            onBlur={(event) => handleNumberBlur(event.target.value)}
            aria-label={`${label} を入力`}
          />
          <span>{unit}</span>
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
};

export default function ControlPanel({
  state,
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
          シンプル
        </button>
        <button
          type="button"
          className={state.viewMode === "detail" ? "active" : ""}
          onClick={() => onViewModeChange("detail")}
        >
          詳細
        </button>
      </div>

      <RangeField
        label="物体距離 (a)"
        value={state.objectDistanceCm}
        min={5}
        max={100}
        step={0.5}
        unit="cm"
        hint="物体からレンズ"
        onChange={(value) => onChange({ objectDistanceCm: value })}
      />
      <RangeField
        label="スクリーン距離"
        value={state.screenDistanceCm}
        min={5}
        max={100}
        step={0.5}
        unit="cm"
        hint="スクリーンからレンズ"
        onChange={(value) => onChange({ screenDistanceCm: value })}
      />
      <RangeField
        label="焦点距離 (f)"
        value={state.focalLengthCm}
        min={5}
        max={100}
        step={0.5}
        unit="cm"
        hint="凸レンズ"
        onChange={(value) => onChange({ focalLengthCm: value })}
      />

      <div className="reset-row">
        <button type="button" className="reset" onClick={onReset}>
          リセット
        </button>
      </div>
    </div>
  );
}
