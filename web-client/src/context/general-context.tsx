import { createContext, ReactNode, useContext } from "react";
import { Session } from "../service/session/interface";
import { useGeneralState } from "../common/hooks/use-general-state";

type GeneralContextType = {
  generalState: GeneralState;
  updateGenerateState: (state: Partial<GeneralState>) => void;
};

export interface GeneralState {
  openedSessions: Session[];
  isChatWidgetOpen: boolean;
  isChatWidgetFullScreen: boolean;
  activeChatSessionId: string | null;
  toolSessionLinks: ToolSessionLink[];
}
export interface ToolSessionLink {
  sessionId: string;
  toolId: string;
  toolName: string;
}

const GeneralContext = createContext<GeneralContextType | undefined>(undefined);
export function GeneralProvider({ children }: { children: ReactNode }) {
  const [currentGeneralState, setCurrentGeneralState] = useGeneralState();

  return (
    <GeneralContext.Provider
      value={{
        generalState: currentGeneralState,
        updateGenerateState: (state: Partial<GeneralState>) => {
          setCurrentGeneralState(state);
        },
      }}
    >
      {children}
    </GeneralContext.Provider>
  );
}

export function useGeneralContext() {
  const context = useContext(GeneralContext);
  if (!context) {
    throw new Error("useGeneralContext must be used within a GeneralProvider");
  }
  return context;
}
