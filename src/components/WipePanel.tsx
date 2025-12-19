import type { ReactNode } from "react";
import type { AppState } from "../state";
import type { ImageDescriptor, LensResult } from "../physics/lens";

interface WipePanelProps {
  state: AppState;
  lensResult: LensResult;
  imageDescriptor: ImageDescriptor | null;
}

const GRID = {
  width: 200,
  height: 150,
  step: 10,
  major: 50,
};

const CENTER = {
  x: GRID.width / 2,
  y: GRID.height / 2,
};

const OBJECT_SCALE = 1;

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

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

const buildTransform = (scale: number, flipX: boolean, flipY: boolean) => {
  const sx = (flipX ? -1 : 1) * scale;
  const sy = (flipY ? -1 : 1) * scale;
  return `translate(${CENTER.x} ${CENTER.y}) scale(${sx} ${sy})`;
};

const buildTicks = (length: number, step: number) =>
  Array.from({ length: Math.floor(length / step) + 1 }, (_, index) => index * step);

const xTicks = buildTicks(GRID.width, 20);
const yTicks = buildTicks(GRID.height, 20);

interface GridStageProps {
  id: string;
  children?: ReactNode;
}

function GridStage({ id, children }: GridStageProps) {
  return (
    <svg
      className="wipe-stage"
      viewBox={`0 0 ${GRID.width} ${GRID.height}`}
      role="img"
      aria-hidden="true"
    >
      <defs>
        <pattern
          id={`grid-small-${id}`}
          width={GRID.step}
          height={GRID.step}
          patternUnits="userSpaceOnUse"
        >
          <path
            d={`M ${GRID.step} 0 L 0 0 0 ${GRID.step}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="0.6"
            className="grid-line"
          />
        </pattern>
        <pattern
          id={`grid-major-${id}`}
          width={GRID.major}
          height={GRID.major}
          patternUnits="userSpaceOnUse"
        >
          <path
            d={`M ${GRID.major} 0 L 0 0 0 ${GRID.major}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="grid-line major"
          />
        </pattern>
      </defs>

      <rect
        width={GRID.width}
        height={GRID.height}
        fill={`url(#grid-small-${id})`}
        className="grid-bg"
      />
      <rect
        width={GRID.width}
        height={GRID.height}
        fill={`url(#grid-major-${id})`}
        className="grid-bg"
      />

      <line
        className="grid-axis"
        x1={CENTER.x}
        y1={0}
        x2={CENTER.x}
        y2={GRID.height}
      />
      <line
        className="grid-axis"
        x1={0}
        y1={CENTER.y}
        x2={GRID.width}
        y2={CENTER.y}
      />

      <g className="grid-ticks">
        {xTicks.map((x) => (
          <line key={`x-${x}`} x1={x} y1={GRID.height} x2={x} y2={GRID.height - 6} />
        ))}
        {yTicks.map((y) => (
          <line key={`y-${y}`} x1={0} y1={y} x2={6} y2={y} />
        ))}
      </g>

      {children}
    </svg>
  );
}

interface GlyphProps {
  scale: number;
  flipX?: boolean;
  flipY?: boolean;
  variant: "object" | "image";
  dashed?: boolean;
  ghost?: boolean;
}

function Glyph({ scale, flipX = false, flipY = false, variant, dashed, ghost }: GlyphProps) {
  const className = [
    "glyph",
    variant === "image" ? "glyph-image" : "glyph-object",
    dashed ? "dashed" : "",
    ghost ? "ghost" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <g className={className} transform={buildTransform(scale, flipX, flipY)}>
      <rect
        className="glyph-body"
        x={-12}
        y={-20}
        width={24}
        height={40}
        rx={4}
        vectorEffect="non-scaling-stroke"
      />
      <rect
        className="glyph-wing"
        x={10}
        y={-12}
        width={8}
        height={16}
        rx={2}
        vectorEffect="non-scaling-stroke"
      />
      <circle
        className="glyph-dot"
        cx={-6}
        cy={-12}
        r={4}
        vectorEffect="non-scaling-stroke"
      />
      <path
        className="glyph-flag"
        d="M -12 18 L -20 14 L -12 10 Z"
        vectorEffect="non-scaling-stroke"
      />
      <rect
        className="glyph-notch"
        x={-8}
        y={6}
        width={10}
        height={6}
        rx={2}
        vectorEffect="non-scaling-stroke"
      />
    </g>
  );
}

export default function WipePanel({
  state,
  lensResult,
  imageDescriptor,
}: WipePanelProps) {
  const magnification = lensResult.magnification;
  const imageScale = magnification === null ? 1 : clamp(Math.abs(magnification), 0.35, 2.8);
  const isInverted = (magnification ?? 1) < 0;
  const hasImage = magnification !== null;
  const isVirtual = !lensResult.isRealImage;
  const isOnScreen = lensResult.isImageOnScreen;

  const lensViewNote = descriptorLabel(imageDescriptor);
  const magnificationText =
    magnification === null ? "倍率: --" : `倍率: ${formatValue(magnification, 2)}×`;

  const screenNote = hasImage
    ? isOnScreen
      ? "スクリーン像（左右反転）"
      : isVirtual
      ? "スクリーンには結像しない"
      : "スクリーン位置がずれています"
    : "像は無限遠";

  return (
    <div className="wipe-grid">
      <div className="wipe-card">
        <div className="wipe-title">元の物体</div>
        <div className="wipe-visual">
          <GridStage id="object">
            <Glyph scale={OBJECT_SCALE} variant="object" />
          </GridStage>
        </div>
        <div className="wipe-detail">
          物体距離: {formatValue(state.objectDistanceCm)} cm
        </div>
      </div>

      <div className="wipe-card">
        <div className="wipe-title">レンズ方向からみた像</div>
        <div className="wipe-visual">
          <GridStage id="lens">
            {hasImage ? (
              <Glyph
                scale={imageScale}
                flipX
                flipY={isInverted}
                variant="image"
                dashed={isVirtual}
              />
            ) : (
              <text className="grid-note" x={CENTER.x} y={CENTER.y} textAnchor="middle">
                像は無限遠
              </text>
            )}
          </GridStage>
        </div>
        <div className="wipe-detail">
          {lensViewNote} / {magnificationText}
        </div>
      </div>

      <div className="wipe-card">
        <div className="wipe-title">スクリーン裏から見た像</div>
        <div className="wipe-visual">
          <GridStage id="screen">
            {hasImage ? (
              <Glyph
                scale={imageScale}
                flipY={isInverted}
                variant="image"
                dashed={isVirtual}
                ghost={!isOnScreen || isVirtual}
              />
            ) : (
              <text className="grid-note" x={CENTER.x} y={CENTER.y} textAnchor="middle">
                像は無限遠
              </text>
            )}
          </GridStage>
        </div>
        <div className="wipe-detail">
          {screenNote}
        </div>
      </div>
    </div>
  );
}
