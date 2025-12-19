export type ViewMode = "simple" | "detail";
export type MobileTab = "experiment" | "image" | "control";

export interface AppState {
  // Physics state
  objectDistanceCm: number;
  screenDistanceCm: number;
  focalLengthCm: number;

  // UI state
  viewMode: ViewMode;
  showRays: boolean;

  // Mobile UI
  activeTab: MobileTab;
}

export const DEFAULT_STATE: AppState = {
  objectDistanceCm: 40,
  screenDistanceCm: 40,
  focalLengthCm: 20,

  viewMode: "simple",
  showRays: true,

  activeTab: "experiment",
};
