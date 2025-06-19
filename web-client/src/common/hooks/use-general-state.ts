import { useState } from "react";
import { StorageHelper } from "../helpers/storage-helper";
import { GeneralState } from "../../context/general-context";

export function useGeneralState(): [
  GeneralState,
  (state: Partial<GeneralState>) => void
] {
  const [currentState, setCurrentState] = useState(
    StorageHelper.getGeneralState()
  );

  const onChange = (state: Partial<GeneralState>) => {
    setCurrentState(StorageHelper.setGeneralState(state));
  };

  return [currentState, onChange];
}
