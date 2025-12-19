import { useMemo } from "react";
import type { AppState } from "../state";
import { calculateLens, describeImage } from "../physics/lens";

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
    () => describeImage(lensResult.magnification, lensResult.isRealImage),
    [lensResult]
  );

  return { lensResult, imageDescriptor };
}
