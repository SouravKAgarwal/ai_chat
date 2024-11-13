import {
  useGetChatsByIdQuery,
  useRefreshChatMutation,
  useUpdateChatMutation,
} from "@/redux/features/chat/chatApi";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import ChatWindow from "./ChatWindow";
import ChatInput from "./ChatInput";
import Loading from "../Loading";

const ChatDetailsPage = ({ chatId, setTitle }) => {
  const [updateChat, { isSuccess }] = useUpdateChatMutation();
  const [input, setInput] = useState("");
  const [previewImage, setPreviewImage] = useState(null);
  const [image, setImage] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [conversation, setConversation] = useState([]);

  const {
    data: chatData,
    refetch,
    isLoading,
  } = useGetChatsByIdQuery(chatId, {
    refetchOnMountOrArgChange: true,
  });

  const [refreshChat, { isSuccess: refreshSuccess }] = useRefreshChatMutation();

  const isChatSavedRef = useRef(false);
  const aiShownUpdatedRef = useRef(false);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const newMessage = { sender: "human", message: input, image };
    const newConversation = [...conversation, newMessage];
    setConversation(newConversation);

    const aiPlaceholderMessage = { sender: "ai", message: "", aiShown: false };
    setConversation((prev) => [...prev, aiPlaceholderMessage]);

    const chatData = {
      chatId,
      prompt: input.trimEnd(),
      image: image,
      file: file,
    };

    try {
      setLoading(true);
      const createdChat = await updateChat(chatData).unwrap();
      isChatSavedRef.current = true;
      setConversation((prev) => {
        const updatedConversation = [...prev];
        const aiMessageIndex = updatedConversation.findIndex(
          (msg) => msg.sender === "ai" && msg.message === ""
        );
        if (aiMessageIndex !== -1) {
          updatedConversation[aiMessageIndex].message =
            createdChat.chat.conversation.slice(-1)[0].message;
        }
        return updatedConversation;
      });
    } catch (error) {
      console.error("Failed to save chat or generate response:", error);
      toast.error("Failed to save chat or generate response.");
    } finally {
      setInput("");
      setImage("");
      setLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const handleRefresh = async (messageIndex) => {
    await refreshChat({
      chatId,
      messageIndex,
    });
  };

  useEffect(() => {
    if (chatData && chatData.chat) {
      setConversation(chatData.chat.conversation);
      setTitle(chatData.chat.title);
    }
  }, [chatData]);

  useEffect(() => {
    if (isSuccess) {
      refetch();
      setInput("");
      setPreviewImage("");
      setImage("");
    }
    if (refreshSuccess) {
      refetch();
    }
  }, [isSuccess, refreshSuccess]);

  useEffect(() => {
    if (!aiShownUpdatedRef.current) {
      const hasUnshownAiMessages = conversation.some(
        (msg) => msg.sender === "ai" && !msg.aiShown
      );

      if (hasUnshownAiMessages) {
        setConversation((prevConversation) =>
          prevConversation.map((msg) =>
            msg.sender === "ai" && !msg.aiShown
              ? { ...msg, aiShown: true }
              : msg
          )
        );
        aiShownUpdatedRef.current = true;
      }
    }
  }, [conversation]);

  return (
    <>
      {isLoading ? (
        <Loading />
      ) : (
        <div className="flex flex-col h-full overflow-auto">
          <div className="flex-1 overflow-y-auto hide-scrollbar mt-16">
            <ChatWindow
              conversation={conversation}
              loading={loading}
              setPreviewImage={setPreviewImage}
              previewImage={previewImage}
              image={image}
              setImage={setImage}
              setConversation={setConversation}
              input={input}
              setInput={setInput}
              handleSendMessage={handleSendMessage}
              handleKeyDown={handleKeyDown}
              handleRefresh={handleRefresh}
            />
          </div>
          <div className="w-full flex items-center flex-col gap-2 pb-2 px-4">
            <ChatInput
              setFile={setFile}
              previewImage={previewImage}
              setPreviewImage={setPreviewImage}
              input={input}
              setInput={setInput}
              image={image}
              setImage={setImage}
              handleSendMessage={handleSendMessage}
              loading={loading}
              handleKeyDown={handleKeyDown}
            />
            <span className="text-center font-thin text-xs mb-1">
              MyGPT can make mistakes. Check important info.
            </span>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatDetailsPage;
