import removeMarkdown from "markdown-to-text";
import Link from "next/link";
import { FaRainbow } from "react-icons/fa";
import { PiDotsThreeBold } from "react-icons/pi";
import SettingsModal from "./profile/Settings";
import { useEffect, useState } from "react";
import Login from "./auth/Login";
import Register from "./auth/Register";
import { useLogoutQuery } from "@/redux/features/auth/authApi";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { categorizeChatsByDate } from "../utils";
import { TbLayoutSidebarFilled } from "react-icons/tb";
import { HiOutlinePencilAlt } from "react-icons/hi";
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import { FiShare, FiEdit2, FiTrash2 } from "react-icons/fi";
import { useShareChatMutation } from "@/redux/features/chat/chatApi";
import ShareDialog from "./chat/ShareDialog";

const Sidebar = ({
  sidebarOpen,
  toggleSidebar,
  conversation,
  handleDelete,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [login, setLogin] = useState(false);
  const [register, setRegister] = useState(false);
  const [userLogout, setUserLogout] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [linkCreated, setLinkCreated] = useState(false);
  const [shareLink, setShareLink] = useState(
    "https://chatai-01.vercel.app/share/..."
  );

  const [chatId, setChatId] = useState("");

  const categorizedChats = categorizeChatsByDate(conversation);
  const { user } = useSelector((state) => state.auth);
  const { isSuccess } = useLogoutQuery(undefined, { skip: !userLogout });
  const [shareChat, { isLoading }] = useShareChatMutation();

  const handleCreateLink = async () => {
    try {
      const { data } = await shareChat({ userId: user?._id, chatId });
      setShareLink(data?.sharedLink);
      setLinkCreated(true);
    } catch (err) {
      console.log(err);
      toast.error(err.message);
    }
  };

  useEffect(() => {
    if (isSuccess) {
      setUserLogout(false);
      toast.success("Logged out successfully!");
    }
  }, [isSuccess]);

  const handleLinkClick = () => {
    if (sidebarOpen && window.innerWidth < 640) {
      toggleSidebar();
    }
  };

  const renderChats = (chats, title) => (
    <div className="first:mt-0 mt-5">
      <p className="text-gray-400 text-xs px-2">{title}</p>
      <ul className="list-none -ml-4">
        {chats.map((chat) => (
          <li
            key={chat._id}
            className={`w-full flex items-center justify-between text-sm group p-2 relative ${
              location.pathname === `/chat/${chat._id}`
                ? "bg-[#222] rounded-lg"
                : "hover:bg-[#222] hover:rounded-lg"
            }`}
          >
            <Link
              href={`/chat/${chat._id}`}
              onClick={handleLinkClick}
              className="overflow-hidden text-ellipsis whitespace-nowrap flex-grow pr-2"
            >
              {removeMarkdown(chat.title).trimEnd()}
            </Link>
            <div className="relative pl-2">
              <PiDotsThreeBold
                size={20}
                className={`cursor-pointer ${
                  location.pathname === `/chat/${chat._id}`
                    ? "visible"
                    : "invisible group-hover:visible"
                }`}
              />
              <Listbox>
                {({ open }) => (
                  <div>
                    <ListboxButton className="absolute inset-0" />
                    {open && (
                      <ListboxOptions className="absolute right-0 mt-2 w-40 bg-[#333] text-white shadow-lg rounded-lg overflow-hidden z-10">
                        <ListboxOption
                          className="flex items-center px-3 py-2 cursor-pointer border-b border-[hsla(0,0%,100%,.15)] hover:bg-[#444] text-sm"
                          value="share"
                          onClick={() => {
                            setShareOpen(true);
                            setChatId(chat._id);
                          }}
                        >
                          <FiShare className="mr-2" />
                          Share
                        </ListboxOption>
                        <ListboxOption
                          className="flex items-center px-3 py-2 cursor-pointer border-b border-[hsla(0,0%,100%,.15)] hover:bg-[#444] text-sm"
                          value="rename"
                          onClick={() => console.log("Rename clicked")}
                        >
                          <FiEdit2 className="mr-2" />
                          Rename
                        </ListboxOption>
                        <ListboxOption
                          className="flex items-center px-3 py-2 cursor-pointer text-red-500 hover:bg-[#444] text-sm"
                          value="delete"
                          onClick={() => handleDelete(chat._id)}
                        >
                          <FiTrash2 className="mr-2" />
                          Delete
                        </ListboxOption>
                      </ListboxOptions>
                    )}
                  </div>
                )}
              </Listbox>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div
      className={`fixed h-full transition-all duration-300 ease-in-out text-[#bbb] px-4 py-2 z-50 flex flex-col flex-shrink-0 ${
        sidebarOpen ? "w-full sm:w-48 md:w-64 bg-[#121212]" : ""
      }`}
    >
      {sidebarOpen && (
        <div className="flex items-center justify-between">
          <span className="flex h-10">
            <button
              className="rounded-lg p-1.5 focus-visible:outline-0 hover:bg-[#222222] disabled:text-[#676767]"
              onClick={toggleSidebar}
            >
              <TbLayoutSidebarFilled className="w-6 h-6" />
            </button>
          </span>
          <span className="flex">
            <Link
              href="/"
              className="rounded-lg p-1.5 focus-visible:outline-0 hover:bg-[#222222] disabled:text-[#676767]"
            >
              <HiOutlinePencilAlt className="w-6 h-6" />
            </Link>
          </span>
        </div>
      )}

      <div className="overflow-y-auto hide-scrollbar flex-grow">
        {sidebarOpen && (
          <div>
            <ul className="gap-3 list-none -ml-4">
              <li className="py-3">
                <Link
                  href="/"
                  onClick={handleLinkClick}
                  className="font-semibold flex gap-2 items-center"
                >
                  <FaRainbow size={16} />
                  MyGPT
                </Link>
              </li>

              <div className="mt-3">
                {categorizedChats.today.length > 0 &&
                  renderChats(categorizedChats.today, "Today")}
                {categorizedChats.yesterday.length > 0 &&
                  renderChats(categorizedChats.yesterday, "Yesterday")}
                {categorizedChats.last7days.length > 0 &&
                  renderChats(categorizedChats.last7days, "Previous 7 days")}
                {categorizedChats.last30days.length > 0 &&
                  renderChats(categorizedChats.last30days, "Previous 30 days")}
                {categorizedChats.older.length > 0 &&
                  renderChats(categorizedChats.older, "Older")}
              </div>
            </ul>
          </div>
        )}
      </div>

      {sidebarOpen && (
        <div className="mt-auto">
          <hr className="border-gray-600 mb-2" />
          {user ? (
            <div
              onClick={() => setIsOpen(true)}
              className="flex cursor-pointer items-center space-x-2 py-2"
            >
              <img
                src={user?.profileImage && user?.profileImage.url}
                alt="Profile"
                className="w-9 h-9 rounded-full"
              />
              <div className="flex flex-col items-start">
                <span className="text-sm">{user.username}</span>
                <span className="text-xs text-[#aaa]">{user.email}</span>
              </div>
            </div>
          ) : (
            <div className="p-4">
              <button
                onClick={() => setLogin(true)}
                className="text-sm font-semibold text-gray-900 dark:text-white cursor-pointer"
              >
                <span>Log in &rarr;</span>
              </button>
            </div>
          )}
        </div>
      )}

      {(login || register || isOpen || shareOpen) && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-70" />
      )}
      <Login login={login} setLogin={setLogin} setRegister={setRegister} />
      <Register
        registered={register}
        setLogin={setLogin}
        setRegister={setRegister}
      />
      <SettingsModal
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        user={user}
        setUserLogout={setUserLogout}
      />
      <ShareDialog
        shareOpen={shareOpen}
        setShareOpen={setShareOpen}
        handleCreateLink={handleCreateLink}
        shareLink={shareLink}
        linkCreated={linkCreated}
        setLinkCreated={setLinkCreated}
        isLoading={isLoading}
      />
    </div>
  );
};

export default Sidebar;
