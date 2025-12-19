import type { AppState } from "../state";
import type { ImageDescriptor, LensResult } from "../physics/lens";

interface WipePanelProps {
  state: AppState;
  lensResult: LensResult;
  imageDescriptor: ImageDescriptor | null;
}

const formatValue = (value: number, digits = 1) => value.toFixed(digits);

const descriptorLabel = (descriptor: ImageDescriptor | null) => {
  if (!descriptor) return "Image at infinity";
  return `${descriptor.type}, ${descriptor.orientation}, ${descriptor.size}`;
};

export default function WipePanel({
  state,
  lensResult,
  imageDescriptor,
}: WipePanelProps) {
  return (
    <div className="wipe-grid">
      <div className="wipe-card">
        <div className="wipe-title">Original</div>
        <div className="wipe-visual">
          <div className="mini-arrow" />
        </div>
        <div className="wipe-detail">
          Object distance: {formatValue(state.objectDistanceCm)} cm
        </div>
      </div>

      <div className="wipe-card">
        <div className="wipe-title">Screen</div>
        <div className="wipe-visual">
          <div
            className={`focus-pill ${
              lensResult.isImageOnScreen ? "focus-pill--good" : "focus-pill--bad"
            }`}
          >
            {lensResult.isImageOnScreen ? "In focus" : "Out of focus"}
          </div>
        </div>
        <div className="wipe-detail">
          Screen distance: {formatValue(state.screenDistanceCm)} cm
        </div>
      </div>

      <div className="wipe-card">
        <div className="wipe-title">Observed</div>
        <div className="wipe-visual">
          <div className={`image-pill ${lensResult.isRealImage ? "" : "image-pill--virtual"}`}>
            {descriptorLabel(imageDescriptor)}
          </div>
        </div>
        <div className="wipe-detail">
          {lensResult.magnification === null
            ? "Magnification: --"
            : `Magnification: ${formatValue(lensResult.magnification, 2)}×`}
        </div>
      </div>
    </div>
  );
}
