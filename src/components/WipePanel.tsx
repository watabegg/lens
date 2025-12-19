import type { AppState } from "../state";
import type { ImageDescriptor, LensResult } from "../physics/lens";

interface WipePanelProps {
  state: AppState;
  lensResult: LensResult;
  imageDescriptor: ImageDescriptor | null;
}

const formatValue = (value: number, digits = 1) => value.toFixed(digits);

const descriptorLabel = (descriptor: ImageDescriptor | null) => {
  if (!descriptor) return "像は無限遠";

  const orientationMap = {
    upright: "正立",
    inverted: "倒立",
  } as const;

  const typeMap = {
    real: "実像",
    virtual: "虚像",
  } as const;

  const sizeMap = {
    enlarged: "拡大",
    reduced: "縮小",
    same: "等倍",
  } as const;

  return `${typeMap[descriptor.type]}・${orientationMap[descriptor.orientation]}・${sizeMap[descriptor.size]}`;
};

export default function WipePanel({
  state,
  lensResult,
  imageDescriptor,
}: WipePanelProps) {
  return (
    <div className="wipe-grid">
      <div className="wipe-card">
        <div className="wipe-title">元の物体</div>
        <div className="wipe-visual">
          <div className="mini-arrow" />
        </div>
        <div className="wipe-detail">
          物体距離: {formatValue(state.objectDistanceCm)} cm
        </div>
      </div>

      <div className="wipe-card">
        <div className="wipe-title">スクリーン</div>
        <div className="wipe-visual">
          <div
            className={`focus-pill ${
              lensResult.isImageOnScreen ? "focus-pill--good" : "focus-pill--bad"
            }`}
          >
            {lensResult.isImageOnScreen ? "合焦" : "ぼけ"}
          </div>
        </div>
        <div className="wipe-detail">
          スクリーン距離: {formatValue(state.screenDistanceCm)} cm
        </div>
      </div>

      <div className="wipe-card">
        <div className="wipe-title">観察像</div>
        <div className="wipe-visual">
          <div className={`image-pill ${lensResult.isRealImage ? "" : "image-pill--virtual"}`}>
            {descriptorLabel(imageDescriptor)}
          </div>
        </div>
        <div className="wipe-detail">
          {lensResult.magnification === null
            ? "倍率: --"
            : `倍率: ${formatValue(lensResult.magnification, 2)}×`}
        </div>
      </div>
    </div>
  );
}
