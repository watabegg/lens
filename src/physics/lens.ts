import type { AppState } from "../state";

export interface LensResult {
  imageDistanceCm: number | null;
  magnification: number | null;
  isRealImage: boolean;
  isInverted: boolean;
  isImageOnScreen: boolean;
}

export interface ImageDescriptor {
  orientation: "upright" | "inverted";
  type: "real" | "virtual";
  size: "enlarged" | "reduced" | "same";
}

export interface ScaleInfo {
  cmToPx: number;
  originX: number;
  axisY: number;
}

export interface OpticalLayout {
  lensX: number;
  objectX: number;
  imageX: number | null;
  screenX: number;
}

export interface RayPoint {
  x: number;
  y: number;
}

export interface Ray {
  points: RayPoint[];
  dashed?: boolean;
}

export interface RayBounds {
  minX: number;
  maxX: number;
}

const EPSILON = 1e-6;

export function calculateLens(
  objectDistanceCm: number,
  focalLengthCm: number,
  screenDistanceCm: number
): LensResult {
  const invB = 1 / focalLengthCm - 1 / objectDistanceCm;

  if (Math.abs(invB) < EPSILON) {
    return {
      imageDistanceCm: null,
      magnification: null,
      isRealImage: false,
      isInverted: false,
      isImageOnScreen: false,
    };
  }

  const imageDistanceCm = 1 / invB;
  const magnification = -imageDistanceCm / objectDistanceCm;
  const isRealImage = imageDistanceCm > 0;
  const isImageOnScreen =
    isRealImage &&
    Math.abs(imageDistanceCm - screenDistanceCm) < 0.5;

  return {
    imageDistanceCm,
    magnification,
    isRealImage,
    isInverted: magnification < 0,
    isImageOnScreen,
  };
}

export function describeImage(
  magnification: number | null,
  isRealImage: boolean
): ImageDescriptor | null {
  if (magnification === null) return null;

  const absMag = Math.abs(magnification);
  return {
    orientation: magnification < 0 ? "inverted" : "upright",
    type: isRealImage ? "real" : "virtual",
    size: absMag > 1 ? "enlarged" : absMag < 1 ? "reduced" : "same",
  };
}

export function computeLayout(
  scale: ScaleInfo,
  state: AppState,
  lens: LensResult
): OpticalLayout {
  const { cmToPx, originX } = scale;

  return {
    lensX: originX,
    objectX: originX - state.objectDistanceCm * cmToPx,
    screenX: originX + state.screenDistanceCm * cmToPx,
    imageX:
      lens.imageDistanceCm !== null
        ? originX + lens.imageDistanceCm * cmToPx
        : null,
  };
}

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

const yAtX = (p1: RayPoint, p2: RayPoint, x: number) => {
  if (Math.abs(p2.x - p1.x) < EPSILON) return p1.y;
  const slope = (p2.y - p1.y) / (p2.x - p1.x);
  return p1.y + slope * (x - p1.x);
};

export function computeRays(
  scale: ScaleInfo,
  state: AppState,
  lens: LensResult,
  objectHeightCm: number,
  bounds: RayBounds
): Ray[] {
  const layout = computeLayout(scale, state, lens);
  const objectHeightPx = objectHeightCm * scale.cmToPx;
  const objectTop: RayPoint = {
    x: layout.objectX,
    y: scale.axisY - objectHeightPx,
  };
  const lensCenter: RayPoint = { x: layout.lensX, y: scale.axisY };

  const focalOffsetPx = state.focalLengthCm * scale.cmToPx;
  const leftFocal: RayPoint = {
    x: layout.lensX - focalOffsetPx,
    y: scale.axisY,
  };
  const rightFocal: RayPoint = {
    x: layout.lensX + focalOffsetPx,
    y: scale.axisY,
  };

  const magnification = lens.magnification ?? 0;
  const displayMag = clamp(magnification, -3.5, 3.5);
  const imageHeightPx = objectHeightPx * displayMag;
  const imageTop: RayPoint | null =
    layout.imageX !== null
      ? { x: layout.imageX, y: scale.axisY - imageHeightPx }
      : null;

  const rays: Ray[] = [];

  // Ray 1: parallel to axis -> through right focal point
  const ray1Lens: RayPoint = { x: layout.lensX, y: objectTop.y };
  const ray1End: RayPoint =
    lens.isRealImage && imageTop
      ? imageTop
      : {
          x: bounds.maxX,
          y: yAtX(ray1Lens, rightFocal, bounds.maxX),
        };
  rays.push({ points: [objectTop, ray1Lens, ray1End] });

  if (!lens.isRealImage && imageTop) {
    rays.push({ points: [ray1Lens, imageTop], dashed: true });
  }

  // Ray 2: through lens center -> straight
  const ray2End: RayPoint =
    lens.isRealImage && imageTop
      ? imageTop
      : {
          x: bounds.maxX,
          y: yAtX(objectTop, lensCenter, bounds.maxX),
        };
  rays.push({ points: [objectTop, lensCenter, ray2End] });

  if (!lens.isRealImage && imageTop) {
    rays.push({ points: [lensCenter, imageTop], dashed: true });
  }

  // Ray 3: through left focal point -> emerges parallel to axis
  const ray3LensY = yAtX(objectTop, leftFocal, layout.lensX);
  const ray3Lens: RayPoint = { x: layout.lensX, y: ray3LensY };
  const ray3End: RayPoint =
    lens.isRealImage && imageTop
      ? imageTop
      : { x: bounds.maxX, y: ray3LensY };
  rays.push({ points: [objectTop, leftFocal, ray3Lens, ray3End] });

  if (!lens.isRealImage && imageTop) {
    rays.push({ points: [ray3Lens, imageTop], dashed: true });
  }

  return rays;
}
