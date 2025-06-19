import { useTranslation } from "react-i18next";
import { useGeneralContext } from "../../context/general-context";
import styles from "../../styles/chat-widget.module.scss";
import { Alert, Header, Spinner } from "@cloudscape-design/components";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Button } from "../ui/button";

import { useEffect, useState } from "react";
import { useService } from "../../service/use-service";
import { Session } from "../../service/session/interface";
import { ChatUI } from "../chat-ui/chat-ui";
import { ChatMessage } from "../../service/chat/interface";
import useChatWebSocket from "../../common/hooks/use-chat-websocket";
import { isOk, unwrapOr, unwrapOrThrow } from "../../service/service-wrapper";
import {
  ChevronLeft,
  Maximize2,
  MessageSquareMore,
  Minimize2,
  Minus,
  Plus,
  Trash,
} from "lucide-react";

export default function ChatWidget() {
  const { generalState, updateGenerateState } = useGeneralContext();

  const { t } = useTranslation(["base", "chatWidget"]);
  const { sessionService, chatService } = useService();
  const [loading, setLoading] = useState(true);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null
  );
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newSessionModalVisible, setNewSessionModalVisible] = useState(false);
  const [sessionDeleteModalVisible, setSessionDeleteModalVisible] =
    useState(false);
  const [newSessionName, setNewSessionName] = useState("");
  const { sendMessage, isWaiting } = useChatWebSocket(
    generalState.activeChatSessionId || "",
    (newMessage) => {
      setChatMessages((prevMessages) => {
        if (!prevMessages) return [newMessage];
        return [...prevMessages, newMessage];
      });
    }
  );

  async function fetchData() {
    setLoading(true);

    const sessions = unwrapOr(await sessionService.getAllSessions(), []);

    updateGenerateState({ openedSessions: sessions });

    if (generalState.activeChatSessionId) {
      const session = sessions.find(
        (session) => session.id === generalState.activeChatSessionId
      );

      if (session) {
        setActiveSession(session);

        const messages = unwrapOr(
          await chatService.getChatMesssageBySessionId(
            generalState.activeChatSessionId
          ),
          []
        );

        setChatMessages(messages);
      }
    }

    setLoading(false);
  }

  useEffect(() => {
    fetchData();
  }, [generalState.activeChatSessionId]);

  return (
    <div
      className={`${styles.chat_widget} ${
        generalState.isChatWidgetFullScreen ? styles.full : ""
      }`}
      style={{
        display: generalState.isChatWidgetOpen ? "block" : "none",
      }}
    >
      <div className={styles.header}>
        <Header
          actions={
            !generalState.activeChatSessionId ? (
              <Button
                variant="default"
                onClick={() => setNewSessionModalVisible(true)}
              >
                <Plus />
                {t("chatWidget:new-chat")}
              </Button>
            ) : (
              <>
                <Button
                  variant="ghost"
                  onClick={() => {
                    updateGenerateState({ activeChatSessionId: null });
                    setActiveSession(null);
                    setChatMessages([]);
                  }}
                >
                  <ChevronLeft />
                  <h3 className="text-lg font-semibold">
                    {activeSession?.name}
                  </h3>
                </Button>
              </>
            )
          }
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              updateGenerateState({
                isChatWidgetFullScreen: !generalState.isChatWidgetFullScreen,
              })
            }
          >
            {generalState.isChatWidgetFullScreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              updateGenerateState({ isChatWidgetOpen: false });
            }}
          >
            <Minus size={4} />
          </Button>
        </Header>
      </div>
      {!generalState.activeChatSessionId && (
        <div className={styles.chat_room_list}>
          {(loading || !Array.isArray(generalState.openedSessions) || generalState.openedSessions.length === 0) && (
            <div className={styles.loading}>
              {(!Array.isArray(generalState.openedSessions) || generalState.openedSessions.length === 0) && !loading && (
                <Alert type="info">{t("chatWidget:no-chat-rooms")}</Alert>
              )}
              {loading && <Spinner size="large" />}
            </div>
          )}
          {Array.isArray(generalState.openedSessions) && generalState.openedSessions
            .sort(
              (a, b) =>
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime()
            )
            .map((chatRoom) => (
              <div
                className={styles.chat_room}
                key={chatRoom.id}
                onClick={() => {
                  updateGenerateState({ activeChatSessionId: chatRoom.id });
                  setActiveSession(chatRoom);
                  setChatMessages([]);
                  fetchData();
                }}
              >
                <div>
                  <MessageSquareMore />
                </div>
                <div>
                  <div className=" font-semibold">
                    <h4>{chatRoom.name}</h4>
                    <p>{new Date(chatRoom.created_at).toLocaleString()}</p>
                  </div>
                </div>
                <div className={styles.spacer} />
                <div
                  className={styles.actions}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedSessionId(chatRoom.id);
                      setSessionDeleteModalVisible(true);
                    }}
                  >
                    <Trash className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
        </div>
      )}
      <div className={styles.chat_ui_wrapper}>
        {generalState.activeChatSessionId && (
          <ChatUI
            messages={chatMessages}
            showCopyButton={true}
            loading={loading}
            running={isWaiting}
            onSendMessage={async (message) => {
              if (!generalState.activeChatSessionId) return;
              sendMessage({
                message,
                role: "user",
                session_id: generalState.activeChatSessionId,
              });
            }}
          />
        )}
      </div>
      <Dialog
        open={newSessionModalVisible}
        onOpenChange={setNewSessionModalVisible}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("chatWidget:new-chat")}</DialogTitle>
            <DialogDescription>
              {t("chatWidget:input-new-chat-name")}
            </DialogDescription>
          </DialogHeader>
          <Input
            value={newSessionName}
            onChange={(e) =>
              setNewSessionName((e.target as HTMLInputElement).value)
            }
            placeholder={t("chatWidget:input-new-chat-name")}
          />
          <DialogFooter>
            <Button
              variant="ghost"
              disabled={isCreatingSession}
              onClick={() => {
                setNewSessionModalVisible(false);
                setNewSessionName("");
              }}
            >
              {t("base:cancel")}
            </Button>
            <Button
              variant="default"
              disabled={newSessionName.length < 3 || newSessionName.length > 25}
              onClick={async () => {
                setIsCreatingSession(true);
                const newSession = unwrapOrThrow(
                  await sessionService.createSession(newSessionName)
                );
                setNewSessionModalVisible(false);
                setNewSessionName("");
                fetchData();
                updateGenerateState({ activeChatSessionId: newSession.id });
                setIsCreatingSession(false);
              }}
            >
              {t("base:ok")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={sessionDeleteModalVisible}
        onOpenChange={setSessionDeleteModalVisible}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("chatWidget:delete-chat")}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {t("chatWidget:delete-chat-confirm")}
          </p>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setSessionDeleteModalVisible(false)}
            >
              {t("base:cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (!selectedSessionId) return;
                const res = isOk(
                  await sessionService.deleteSession(selectedSessionId)
                );
                if (!res) return;
                setSessionDeleteModalVisible(false);
                updateGenerateState({
                  activeChatSessionId: null,
                  toolSessionLinks: generalState.toolSessionLinks.filter(
                    (link) => link.sessionId !== selectedSessionId
                  ),
                });
                fetchData();
              }}
            >
              {t("base:delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
