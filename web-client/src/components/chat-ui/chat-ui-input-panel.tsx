import { useEffect, useLayoutEffect, useState } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { ChatScrollState } from "./chat-ui";
import styles from "../../styles/chat-ui.module.scss";
import { ChatMessage } from "../../service/chat/interface";
import { useTranslation } from "react-i18next";
import { Button } from "../../components/ui/button";
import { SendHorizonal } from "lucide-react";

export interface ChatUIInputPanelProps {
  inputPlaceholderText?: string;
  sendButtonText?: string;
  running?: boolean;
  messages?: ChatMessage[];
  onSendMessage?: (message: string) => void;
}

export default function ChatUIInputPanel(props: ChatUIInputPanelProps) {
  const [inputText, setInputText] = useState("");
  const { t } = useTranslation(["base", "chatWidget"]);

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

      ChatScrollState.userHasScrolled = !isScrollToTheEnd;
    };

    window.addEventListener("scroll", onWindowScroll);
    return () => window.removeEventListener("scroll", onWindowScroll);
  }, []);

  useLayoutEffect(() => {
    if (ChatScrollState.skipNextHistoryUpdate) {
      ChatScrollState.skipNextHistoryUpdate = false;
      return;
    }

    if (!ChatScrollState.userHasScrolled && (props.messages ?? []).length > 0) {
      ChatScrollState.skipNextScrollEvent = true;
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
  }, [props.messages]);

  const onSendMessage = () => {
    ChatScrollState.userHasScrolled = false;
    props.onSendMessage?.(inputText);
    setInputText("");
  };

  const onTextareaKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (!props.running && event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      onSendMessage();
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className={styles.input_textarea_container}>
        <TextareaAutosize
          className={styles.input_textarea}
          maxRows={6}
          minRows={1}
          spellCheck={true}
          autoFocus
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={onTextareaKeyDown}
          value={inputText}
          placeholder={
            props.inputPlaceholderText ??
            t("chatWidget:chat-ui.input-placeholder")
          }
        />
        <div className="ml-2">
          <Button
            size="icon"
            variant="default"
            disabled={props.running || inputText.trim().length === 0}
            onClick={onSendMessage}
          >
            <SendHorizonal className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
