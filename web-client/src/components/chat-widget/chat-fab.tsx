import styles from "../../styles/chat-widget.module.scss";
import iconSvg from "../../assets/images/aigendrug.svg";
import { useGeneralContext } from "../../context/general-context";

export default function ChatFab() {
  const { generalState, updateGenerateState } = useGeneralContext();

  return (
    <div
      className={`${styles.chat_fab} ${
        generalState.isChatWidgetOpen ? styles.tilt : ""
      }`}
      onClick={() =>
        updateGenerateState({
          isChatWidgetOpen: !generalState.isChatWidgetOpen,
        })
      }
    >
      <img src={iconSvg} alt="Chat" />
    </div>
  );
}
