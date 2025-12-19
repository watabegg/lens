import type { AppState, ViewMode } from "../state";
import {
  computeLayout,
  computeRays,
  type LensResult,
  type Ray,
  type ScaleInfo,
} from "../physics/lens";

interface ExperimentCanvasProps {
  state: AppState;
  lensResult: LensResult;
  showRays: boolean;
  viewMode: ViewMode;
}

const VIEWBOX = { width: 900, height: 360 };
const OBJECT_HEIGHT_CM = 6;
const PADDING_PX = 60;

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

const formatValue = (value: number, digits = 1) => value.toFixed(digits);

const arrowHeadPoints = (x: number, y: number, direction: 1 | -1) => {
  const headWidth = 10;
  const headHeight = 12;
  const baseY = y + direction * headHeight;
  return `${x},${y} ${x - headWidth / 2},${baseY} ${x + headWidth / 2},${baseY}`;
};

const buildRayPath = (ray: Ray) =>
  ray.points.map((point, index) => `${index === 0 ? "M" : "L"}${point.x} ${point.y}`).join(" ");

const computeScale = (state: AppState, lensResult: LensResult): ScaleInfo => {
  const maxDistanceCm = Math.max(
    state.objectDistanceCm,
    state.screenDistanceCm,
    lensResult.imageDistanceCm ? Math.abs(lensResult.imageDistanceCm) : 0,
    state.focalLengthCm,
    1
  );
  const cmToPx = clamp(
    (VIEWBOX.width / 2 - PADDING_PX) / maxDistanceCm,
    6,
    18
  );

  return {
    cmToPx,
    originX: VIEWBOX.width / 2,
    axisY: VIEWBOX.height / 2,
  };
};

export default function ExperimentCanvas({
  state,
  lensResult,
  showRays,
  viewMode,
}: ExperimentCanvasProps) {
  const scale = computeScale(state, lensResult);
  const layout = computeLayout(scale, state, lensResult);
  const objectHeightPx = OBJECT_HEIGHT_CM * scale.cmToPx;
  const displayMagnification = clamp(lensResult.magnification ?? 0, -3.5, 3.5);
  const imageHeightPx = objectHeightPx * displayMagnification;
  const imageTopY = scale.axisY - imageHeightPx;
  const lensHalfHeight = Math.min(VIEWBOX.height * 0.42, scale.cmToPx * 8);

  const leftFocalX = layout.lensX - state.focalLengthCm * scale.cmToPx;
  const rightFocalX = layout.lensX + state.focalLengthCm * scale.cmToPx;

  const rays = showRays
    ? computeRays(scale, state, lensResult, OBJECT_HEIGHT_CM, {
        minX: 0,
        maxX: VIEWBOX.width,
      })
    : [];

  const imageIsVirtual = !lensResult.isRealImage && lensResult.imageDistanceCm !== null;

  return (
    <div className="canvas-wrap">
      <svg
        className="experiment-canvas"
        viewBox={`0 0 ${VIEWBOX.width} ${VIEWBOX.height}`}
        role="img"
        aria-label="Convex lens experiment diagram"
      >
        <line
          className="axis-line"
          x1={0}
          y1={scale.axisY}
          x2={VIEWBOX.width}
          y2={scale.axisY}
        />

        <line
          className="screen-line"
          x1={layout.screenX}
          y1={scale.axisY - lensHalfHeight}
          x2={layout.screenX}
          y2={scale.axisY + lensHalfHeight}
        />
        <text className="label" x={layout.screenX} y={scale.axisY + lensHalfHeight + 18} textAnchor="middle">
          Screen
        </text>

        <line
          className="lens-line"
          x1={layout.lensX}
          y1={scale.axisY - lensHalfHeight}
          x2={layout.lensX}
          y2={scale.axisY + lensHalfHeight}
        />
        <path
          className="lens-outline"
          d={`M ${layout.lensX - 18} ${scale.axisY - lensHalfHeight} Q ${layout.lensX} ${scale.axisY - lensHalfHeight - 18} ${layout.lensX + 18} ${scale.axisY - lensHalfHeight} L ${layout.lensX + 18} ${scale.axisY + lensHalfHeight} Q ${layout.lensX} ${scale.axisY + lensHalfHeight + 18} ${layout.lensX - 18} ${scale.axisY + lensHalfHeight} Z`}
        />
        <text className="label" x={layout.lensX} y={scale.axisY - lensHalfHeight - 12} textAnchor="middle">
          Lens
        </text>

        <circle className="focal-point" cx={leftFocalX} cy={scale.axisY} r={4} />
        <circle className="focal-point" cx={rightFocalX} cy={scale.axisY} r={4} />
        <text className="label" x={leftFocalX} y={scale.axisY + 20} textAnchor="middle">
          F
        </text>
        <text className="label" x={rightFocalX} y={scale.axisY + 20} textAnchor="middle">
          F
        </text>

        <line
          className="object-arrow"
          x1={layout.objectX}
          y1={scale.axisY}
          x2={layout.objectX}
          y2={scale.axisY - objectHeightPx}
        />
        <polygon
          className="object-arrow"
          points={arrowHeadPoints(layout.objectX, scale.axisY - objectHeightPx, 1)}
        />
        <text className="label" x={layout.objectX} y={scale.axisY + 20} textAnchor="middle">
          Object
        </text>

        {lensResult.imageDistanceCm !== null && (
          <g className={imageIsVirtual ? "image-arrow virtual" : "image-arrow"}>
            <line
              x1={layout.imageX ?? layout.lensX}
              y1={scale.axisY}
              x2={layout.imageX ?? layout.lensX}
              y2={imageTopY}
            />
            <polygon
              points={arrowHeadPoints(
                layout.imageX ?? layout.lensX,
                imageTopY,
                imageTopY < scale.axisY ? 1 : -1
              )}
            />
            <text
              className="label"
              x={layout.imageX ?? layout.lensX}
              y={imageTopY + (imageTopY < scale.axisY ? -14 : 24)}
              textAnchor="middle"
            >
              Image
            </text>
          </g>
        )}

        {showRays && (
          <g className="rays">
            {rays.map((ray, index) => (
              <path
                key={`${ray.dashed ? "dashed" : "solid"}-${index}`}
                className={`ray${ray.dashed ? " dashed" : ""}`}
                d={buildRayPath(ray)}
              />
            ))}
          </g>
        )}

        {viewMode === "detail" && (
          <g className="detail-layer">
            <text
              className="detail-text"
              x={layout.objectX}
              y={scale.axisY - objectHeightPx - 18}
              textAnchor="middle"
            >
              a = {formatValue(state.objectDistanceCm)} cm
            </text>
            <text
              className="detail-text"
              x={layout.screenX}
              y={scale.axisY + lensHalfHeight + 36}
              textAnchor="middle"
            >
              screen = {formatValue(state.screenDistanceCm)} cm
            </text>
            <text
              className="detail-text"
              x={layout.lensX + 12}
              y={scale.axisY - lensHalfHeight - 36}
            >
              f = {formatValue(state.focalLengthCm)} cm
            </text>
            {lensResult.imageDistanceCm !== null && (
              <text
                className="detail-text"
                x={layout.imageX ?? layout.lensX}
                y={scale.axisY - Math.sign(imageHeightPx || 1) * 18}
                textAnchor="middle"
              >
                b = {formatValue(lensResult.imageDistanceCm)} cm
              </text>
            )}
          </g>
        )}
      </svg>
    </div>
  );
}
