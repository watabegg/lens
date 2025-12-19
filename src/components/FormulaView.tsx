import type { AppState, ViewMode } from "../state";
import type { LensResult } from "../physics/lens";

interface FormulaViewProps {
  viewMode: ViewMode;
  state: AppState;
  lensResult: LensResult;
}

const formatValue = (value: number, digits = 2) => value.toFixed(digits);

export default function FormulaView({ viewMode, state, lensResult }: FormulaViewProps) {
  return (
    <div className="formula-card">
      <div className="formula-title">レンズの公式</div>
      <div className="formula-equation">1 / f = 1 / a + 1 / b</div>
      {viewMode === "detail" && (
        <div className="formula-values">
          <div>f = {formatValue(state.focalLengthCm, 1)} cm</div>
          <div>a = {formatValue(state.objectDistanceCm, 1)} cm</div>
          <div>
            b =
            {lensResult.imageDistanceCm === null
              ? " 無限遠"
              : ` ${formatValue(lensResult.imageDistanceCm, 1)} cm`}
          </div>
        </div>
      )}
      {lensResult.imageDistanceCm === null && (
        <div className="formula-note">像は無限遠（物体が焦点上）。</div>
      )}
    </div>
  );
}
