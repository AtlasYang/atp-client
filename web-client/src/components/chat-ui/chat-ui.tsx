import { StatusIndicator } from "@cloudscape-design/components";
import ChatUIInputPanel from "./chat-ui-input-panel";
import { MutableRefObject, useEffect } from "react";
import ChatUIMessageList from "./chat-ui-message-list";
import styles from "../../styles/chat-ui.module.scss";
import { ChatMessage } from "../../service/chat/interface";

export interface ChatUIProps {
  loading?: boolean;
  running?: boolean;
  messages?: ChatMessage[];
  welcomeText?: string;
  inputPlaceholderText?: string;
  sendButtonText?: string;
  showCopyButton?: boolean;
  onSendMessage?: (message: string) => void;
}

export abstract class ChatScrollState {
  static scrollableElementRef: MutableRefObject<HTMLDivElement | null> | null =
    null;
  static userHasScrolled = false;
  static skipNextScrollEvent = false;
  static skipNextHistoryUpdate = false;
}

export function ChatUI(props: ChatUIProps) {
  useEffect(() => {
    const onWindowScroll = () => {
      if (ChatScrollState.skipNextScrollEvent) {
        ChatScrollState.skipNextScrollEvent = false;
        return;
      }

      const isScrollToTheEnd =
        Math.abs(
          window.innerHeight +
            window.scrollY -
            document.documentElement.scrollHeight
        ) <= 10;

      if (!isScrollToTheEnd) {
        ChatScrollState.userHasScrolled = true;
      } else {
        const containerRef = ChatScrollState.scrollableElementRef?.current;

        if (containerRef) {
          setTimeout(() => {
            containerRef.scrollTo({
              top: containerRef.scrollHeight,
              behavior: "smooth",
            });
          }, 100);
        }
        ChatScrollState.userHasScrolled = false;
      }
    };

    window.addEventListener("scroll", onWindowScroll);

    return () => {
      window.removeEventListener("scroll", onWindowScroll);
    };
  }, []);

  return (
    <div className={styles.chat_container}>
      <ChatUIMessageList
        loading={props.loading}
        running={props.running}
        messages={props.messages}
        showCopyButton={props.showCopyButton}
      />
      <div className={styles.welcome_text}>
        {props.loading && (
          <center>
            <StatusIndicator type="loading">Loading</StatusIndicator>
          </center>
        )}
      </div>
      <div className={styles.input_container}>
        <ChatUIInputPanel {...props} />
      </div>
    </div>
  );
}
