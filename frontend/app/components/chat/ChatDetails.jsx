import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  useDeleteChatMutation,
  useGetChatsByUserIdQuery,
} from "@/redux/features/chat/chatApi";
import Heading from "../Heading";
import Sidebar from "../Sidebar";
import ChatDetailsPage from "./ChatDetailsPage";
import Header from "../Header";

const ChatDetails = ({ chatId }) => {
  const router = useRouter();
  const { user } = useSelector((state) => state.auth);
  const [deleteChat, { isSuccess: deleteSuccess }] = useDeleteChatMutation();
  const {
    data: chatDataUser,
    isLoading,
    refetch,
  } = useGetChatsByUserIdQuery(
    { userId: user?._id },
    { refetchOnMountOrArgChange: true }
  );

  const [chats, setChats] = useState([]);
  const [title, setTitle] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(
    localStorage.getItem("sidebarOpen") === "true"
  );

  useEffect(() => {
    if (chatDataUser && chatDataUser.chats) {
      setChats(chatDataUser.chats);
    }
  }, [chatDataUser]);

  useEffect(() => {
    if (deleteSuccess) {
      refetch();
      toast.success("Deleted successfully");
    }
  }, [deleteSuccess]);

  const toggleSidebar = () => {
    setSidebarOpen((prevOpen) => !prevOpen);
    localStorage.setItem("sidebarOpen", !sidebarOpen);
  };

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

  const handleDelete = async (id) => {
    await deleteChat(id);
    if (id === chatId) {
      router.push("/");
    }
  };

  return (
    <div className="flex h-[100dvh] md:h-screen overflow-hidden">
      <Heading title={title} />
      <Sidebar
        sidebarOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
        conversation={chats}
        isLoading={isLoading}
        handleDelete={handleDelete}
      />
      <div
        className={`transition-all duration-300 flex-1 flex flex-col ${
          sidebarOpen && "ml-0 sm:ml-48 md:ml-64"
        }`}
      >
        <Header title={title} toggleSidebar={toggleSidebar} />
        <ChatDetailsPage
          chatId={chatId}
          user={user}
          title={title}
          setTitle={setTitle}
        />
      </div>
    </div>
  );
};

export default ChatDetails;
