import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  useCreateChatMutation,
  useDeleteChatMutation,
  useGetChatsByUserIdQuery,
} from "@/redux/features/chat/chatApi";
import { useRouter } from "next/navigation";
import ChatWindow from "./ChatWindow";
import ChatInput from "./ChatInput";
import Sidebar from "../Sidebar";
import Navbar from "../Navbar";

const NewChat = ({ user }) => {
  const router = useRouter();
  const [createChat, { isSuccess }] = useCreateChatMutation();
  const [chats, setChats] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(
    localStorage.getItem("sidebarOpen") === "true"
  );
  const [title, setTitle] = useState("");
  const [input, setInput] = useState("");
  const [image, setImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [file, setFile] = useState(null);
  const [conversation, setConversation] = useState([]);
  const [loading, setLoading] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState("");

  const {
    data: chatData,
    isLoading,
    refetch,
  } = useGetChatsByUserIdQuery(
    {
      userId: user?._id,
    },
    { refetchOnMountOrArgChange: true }
  );

  const [deleteChat, { isSuccess: deleteSuccess }] = useDeleteChatMutation();

  const toggleSidebar = () => {
    setSidebarOpen((prevOpen) => !prevOpen);
    localStorage.setItem("sidebarOpen", !sidebarOpen);
  };

  const handleDelete = async (id) => {
    await deleteChat(id);
  };

  useEffect(() => {
    if (chatData && chatData.chats) {
      setChats(chatData.chats || []);
    }
    if (deleteSuccess) {
      refetch();
      toast.success("Deleted successfully");
    }
  }, [chatData, deleteSuccess]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const newMessage = { sender: "human", message: input, image };
    setConversation((prevConversation) => [...prevConversation, newMessage]);

    const chatData = {
      userId: user._id,
      prompt: input.trimEnd(),
      file,
      image,
    };

    try {
      setLoading(true);
      const createdChat = await createChat(chatData).unwrap();
      setTitle(createdChat?.chat?.title);
      const aiMessage = createdChat.chat.conversation.slice(-1)[0];

      setConversation((prevConversation) => {
        const updatedConversation = [...prevConversation];
        const lastAiMessageIndex = updatedConversation.length - 1;
        updatedConversation[lastAiMessageIndex] = aiMessage;

        return updatedConversation;
      });

      setRedirectUrl(`/chat/${createdChat?.chat?._id}`);
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    } finally {
      setInput("");
      setImage(null);
      setLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  useEffect(() => {
    if (isSuccess) {
      refetch();
      setInput("");
      setImage(null);
      setPreviewImage(null);
    }
  }, [isSuccess, refetch]);

  useEffect(() => {
    if (redirectUrl) {
      router.push(redirectUrl);
    }
  }, [redirectUrl]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(localStorage.getItem("sidebarOpen") === "true");
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <Sidebar
        sidebarOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
        conversation={chats}
        isLoading={isLoading}
        handleDelete={handleDelete}
      />
      <div
        className={`transition-all duration-200 flex-1 flex flex-col ${
          sidebarOpen && "ml-0 sm:ml-48 md:ml-64"
        }`}
      >
        <Navbar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
        <div className="flex flex-col h-full overflow-auto">
          <div className="flex-1 overflow-y-auto hide-scrollbar">
            <ChatWindow
              className="overflow-y-auto"
              setFile={setFile}
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
            />
          </div>
          {conversation.length > 0 && (
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
          )}
        </div>
      </div>
    </>
  );
};

export default NewChat;
