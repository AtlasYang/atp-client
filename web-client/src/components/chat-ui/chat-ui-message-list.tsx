import ChatUIMessage from "./chat-ui-message";
import { ChatMessage } from "../../service/chat/interface";
import { useEffect, useRef } from "react";
import { ChatScrollState } from "./chat-ui";
import styles from "../../styles/chat-ui.module.scss";
import SupportPromptGroup from "@cloudscape-design/chat-components/support-prompt-group";
import { Spinner } from "@cloudscape-design/components";

export interface ChatUIMessageListProps {
  loading?: boolean;
  running?: boolean;
  messages?: ChatMessage[];
  showCopyButton?: boolean;
}

export default function ChatUIMessageList(props: ChatUIMessageListProps) {
  const scrollableElementRef = useRef<HTMLDivElement | null>(null);
  const messages = props.messages || [];

  useEffect(() => {
    ChatScrollState.scrollableElementRef = scrollableElementRef;
  }, [scrollableElementRef]);

  return (
    <div ref={scrollableElementRef} className={styles.chat_message_list}>
      {!props.loading && messages.length === 0 && (
        <SupportPromptGroup
          ariaLabel="Support Prompt Group"
          onItemClick={() => {}}
          items={[
            {
              id: "1",
              text: "I need to predict affinity",
            },
            {
              id: "2",
              text: "What model can be used for predicting affinity?",
            },
          ]}
        />
      )}
      {messages.map((message, idx) => (
        <ChatUIMessage
          key={idx}
          message={message}
          showCopyButton={props.showCopyButton}
        />
      ))}
      {props.running && (
        <div className={styles.chat_message_list_loading}>
          <Spinner size="big" />
        </div>
      )}
    </div>
  );
}
