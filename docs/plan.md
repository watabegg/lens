# 凸レンズ実験Webアプリ 設計書（状態設計・物理計算）

## 前提

- `npx create vite@latest` で React + TypeScript プロジェクトを作成済み
- SPA（1ページ）
- 描画は SVG（Canvas 不使用）
- 単位は cm に統一
- 幾何光学（中学理科レベル）
- 凸レンズのみ
- 主光線3本（ON/OFFあり）
- UI と物理計算は分離

---

## 状態設計の基本方針

- ユーザーが直接操作するもののみを state にする
- 物理法則で決まる値はすべて派生値（computed）
- UI状態と物理状態を分離
- 数値計算は副作用なしの pure function にする

---

## グローバル State（App が保持）

```ts
type ViewMode = "simple" | "detail";
type MobileTab = "experiment" | "image" | "control";

interface AppState {
  // ===== 物理状態（操作可能） =====
  objectDistanceCm: number;   // a: 物体 → レンズ距離
  screenDistanceCm: number;   // スクリーン → レンズ距離
  focalLengthCm: number;      // f: 焦点距離（凸レンズ）

  // ===== UI 状態 =====
  viewMode: ViewMode;         // 表示モード
  showRays: boolean;          // 主光線表示 ON/OFF

  // ===== モバイル用 =====
  activeTab: MobileTab;
}
````

---

## 初期状態（プリセット）

```ts
export const DEFAULT_STATE: AppState = {
  objectDistanceCm: 30,
  screenDistanceCm: 20,
  focalLengthCm: 10,

  viewMode: "simple",
  showRays: true,

  activeTab: "experiment",
};
```

---

## レンズ計算の派生値

### レンズ計算結果型

```ts
interface LensResult {
  imageDistanceCm: number | null; // b: 像距離（null = 無限遠 or 焦点上）
  magnification: number | null;   // 倍率 m
  isRealImage: boolean;           // 実像か
  isInverted: boolean;            // 倒立か
  isImageOnScreen: boolean;       // スクリーンに像が結ばれているか
}
```

---

### レンズ計算ロジック（pure function）

```ts
export function calculateLens(
  a: number,              // object distance
  f: number,              // focal length
  screenDistance: number  // screen distance
): LensResult {
  // レンズの公式: 1/f = 1/a + 1/b
  const invB = 1 / f - 1 / a;

  // 像が無限遠（焦点上）
  if (invB === 0) {
    return {
      imageDistanceCm: null,
      magnification: null,
      isRealImage: false,
      isInverted: false,
      isImageOnScreen: false,
    };
  }

  const b = 1 / invB;
  const m = -b / a;

  const isReal = b > 0;
  const isOnScreen =
    isReal && Math.abs(b - screenDistance) < 0.5; // 許容誤差 0.5cm

  return {
    imageDistanceCm: b,
    magnification: m,
    isRealImage: isReal,
    isInverted: m < 0,
    isImageOnScreen: isOnScreen,
  };
}
```

---

## 像の分類（表示用）

```ts
interface ImageDescriptor {
  orientation: "upright" | "inverted";
  type: "real" | "virtual";
  size: "enlarged" | "reduced" | "same";
}
```

```ts
export function describeImage(
  magnification: number | null,
  isReal: boolean
): ImageDescriptor | null {
  if (magnification === null) return null;

  return {
    orientation: magnification < 0 ? "inverted" : "upright",
    type: isReal ? "real" : "virtual",
    size:
      Math.abs(magnification) > 1
        ? "enlarged"
        : Math.abs(magnification) < 1
        ? "reduced"
        : "same",
  };
}
```

---

## SVG 描画用スケール情報

```ts
interface ScaleInfo {
  cmToPx: number;  // 1cm あたりの px
  originX: number; // レンズ位置 X
  axisY: number;   // 光軸 Y
}
```

---

## 光学要素の描画座標

```ts
interface OpticalLayout {
  lensX: number;
  objectX: number;
  imageX: number | null;
  screenX: number;
}
```

```ts
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
```

---

## 光線（Ray）構造

```ts
interface RayPoint {
  x: number;
  y: number;
}

interface Ray {
  points: RayPoint[];
  dashed?: boolean; // 虚像用延長線
}
```

* 主光線3本

  * 光軸に平行 → 焦点
  * レンズ中心 → 直進
  * 焦点 → 光軸に平行
* 虚像時は延長線を dashed 表示

---

## Custom Hook（物理計算まとめ）

```ts
import { useMemo } from "react";

export function useLensPhysics(state: AppState) {
  const lensResult = useMemo(
    () =>
      calculateLens(
        state.objectDistanceCm,
        state.focalLengthCm,
        state.screenDistanceCm
      ),
    [state.objectDistanceCm, state.focalLengthCm, state.screenDistanceCm]
  );

  const imageDescriptor = useMemo(
    () =>
      describeImage(
        lensResult.magnification,
        lensResult.isRealImage
      ),
    [lensResult]
  );

  return {
    lensResult,
    imageDescriptor,
  };
}
```

---

## コンポーネント責務分離

```
App
 ├ Header
 ├ ExperimentCanvas（SVG）
 │   ├ ObjectShape
 │   ├ LensShape
 │   ├ ScreenShape
 │   └ Rays
 ├ WipePanel
 │   ├ OriginalView
 │   ├ ScreenImageView
 │   └ ObservedImageView
 ├ ControlPanel
 │   ├ ModeToggle
 │   ├ Sliders
 │   ├ FormulaView
 │   └ ResetButton
 └ MobileTabBar
```

| コンポーネント          | 役割       |
| ---------------- | -------- |
| App              | state 管理 |
| ExperimentCanvas | 実験図描画    |
| WipePanel        | 像の比較表示   |
| ControlPanel     | UI操作     |
| FormulaView      | レンズ公式表示  |

---

## 補足設計ルール

* 数値計算はすべて cm
* グラデーション禁止
* 単色＋線幅で視認性を確保
* SVG viewBox は中央にレンズ
* 物理計算と描画ロジックは分離
