import { Mode, applyMode } from "@cloudscape-design/global-styles";
import { NavigationPanelState } from "../types";
import { GeneralState } from "../../context/general-context";

const PREFIX = "aigendrug-platform";
const THEME_STORAGE_NAME = `${PREFIX}-theme`;
const NAVIGATION_PANEL_STATE_STORAGE_NAME = `${PREFIX}-navigation-panel-state`;
const GENERAL_STATE_STORAGE_NAME = `${PREFIX}-general-state`;

export abstract class StorageHelper {
  static getTheme() {
    const value = localStorage.getItem(THEME_STORAGE_NAME) ?? Mode.Light;
    const theme = value === Mode.Dark ? Mode.Dark : Mode.Light;

    return theme;
  }

  static applyTheme(theme: Mode) {
    localStorage.setItem(THEME_STORAGE_NAME, theme);
    applyMode(theme);

    document.documentElement.style.setProperty(
      "--app-color-scheme",
      theme === Mode.Dark ? "dark" : "light"
    );

    return theme;
  }

  static getNavigationPanelState(): NavigationPanelState {
    const value =
      localStorage.getItem(NAVIGATION_PANEL_STATE_STORAGE_NAME) ??
      JSON.stringify({
        collapsed: true,
      });

    let state: NavigationPanelState | null = null;
    try {
      state = JSON.parse(value);
    } catch {
      state = {};
    }

    return state ?? {};
  }

  static setNavigationPanelState(state: Partial<NavigationPanelState>) {
    const currentState = this.getNavigationPanelState();
    const newState = { ...currentState, ...state };
    const stateStr = JSON.stringify(newState);
    localStorage.setItem(NAVIGATION_PANEL_STATE_STORAGE_NAME, stateStr);

    return newState;
  }

  static getGeneralState(): GeneralState {
    const defaultState = {
      openedSessions: [],
      isChatWidgetOpen: false,
      isChatWidgetFullScreen: false,
      activeChatSessionId: null,
      toolSessionLinks: [],
    };

    const value =
      localStorage.getItem(GENERAL_STATE_STORAGE_NAME) ??
      JSON.stringify(defaultState);

    let state: GeneralState | null = null;
    try {
      state = JSON.parse(value);
    } catch {
      state = defaultState;
    }

    const finalState = state ?? defaultState;
    
    // Ensure openedSessions is always an array
    if (!Array.isArray(finalState.openedSessions)) {
      finalState.openedSessions = [];
    }
    
    // Ensure toolSessionLinks is always an array
    if (!Array.isArray(finalState.toolSessionLinks)) {
      finalState.toolSessionLinks = [];
    }

    return finalState;
  }

  static setGeneralState(state: Partial<GeneralState>) {
    const currentState = this.getGeneralState();
    const newState = { ...currentState, ...state };
    const stateStr = JSON.stringify(newState);
    localStorage.setItem(GENERAL_STATE_STORAGE_NAME, stateStr);

    return newState;
  }
}
