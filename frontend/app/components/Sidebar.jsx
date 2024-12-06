import removeMarkdown from "markdown-to-text";
import Link from "next/link";
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
import { RiArchive2Line } from "react-icons/ri";
import { FiShare, FiEdit2, FiTrash2 } from "react-icons/fi";
import {
  useArchiveChatMutation,
  useGetArchivedChatsQuery,
  useRenameChatMutation,
  useShareChatMutation,
} from "@/redux/features/chat/chatApi";
import ShareDialog from "./chat/ShareDialog";
import { useLoadUserQuery } from "@/redux/features/api/apiSlices";
import Image from "next/image";

const Sidebar = ({
  sidebarOpen,
  toggleSidebar,
  conversation,
  handleDelete,
  refetchChats,
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
  const [editingChatId, setEditingChatId] = useState(null);
  const [newTitle, setNewTitle] = useState("");

  const categorizedChats = categorizeChatsByDate(conversation);
  const { user } = useSelector((state) => state.auth);
  const { refetch } = useLoadUserQuery({}, { refetchOnMountOrArgChange: true });
  const { isSuccess } = useLogoutQuery(undefined, { skip: !userLogout });
  const [shareChat, { isSuccess: shareChatSuccess }] = useShareChatMutation();
  const [renameChat] = useRenameChatMutation();
  const [archiveChat, { isSuccess: archiveSuccess }] = useArchiveChatMutation();
  const { refetch: refetchArchivedChats } = useGetArchivedChatsQuery(
    {},
    { refetchOnMountOrArgChange: true }
  );

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
      refetch();
      setUserLogout(false);
      toast.success("Logged out successfully!");
    }
    if (shareChatSuccess) {
      refetch();
    }
    if (archiveSuccess) {
      refetchChats();
      refetchArchivedChats();
    }
  }, [isSuccess, shareChatSuccess, archiveSuccess]);

  const handleRename = (chatId) => {
    setEditingChatId(chatId);
    const chat = conversation.find((c) => c._id === chatId);
    setNewTitle(chat?.title || "");
  };

  const handleArchive = async (chatId) => {
    try {
      await archiveChat(chatId);
      toast.success("Chat archived");
    } catch (err) {
      toast.error("Failed to archive.");
    }
  };

  const handleRenameSubmit = async () => {
    try {
      await renameChat({ chatId: editingChatId, newTitle });
      toast.success("Chat title updated!");
    } catch (err) {
      toast.error("Failed to update chat title.");
    } finally {
      setEditingChatId(null);
    }
  };

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
                : "hover:bg-[#1c1c1c] hover:rounded-lg"
            }`}
          >
            {editingChatId === chat._id ? (
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleRenameSubmit();
                  if (e.key === "Escape") setEditingChatId(null);
                }}
                className="bg-transparent border p-2 rounded border-gray-500 focus:outline-none text-white w-full"
                autoFocus
              />
            ) : (
              <Link
                href={`/chat/${chat._id}`}
                onClick={handleLinkClick}
                title={removeMarkdown(chat.title).trimEnd()}
                aria-label={removeMarkdown(chat.title).trimEnd()}
                className="overflow-hidden text-ellipsis whitespace-nowrap flex-grow pr-2"
              >
                {removeMarkdown(chat.title).trimEnd()}
              </Link>
            )}
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
                          onClick={() => handleRename(chat._id)}
                        >
                          <FiEdit2 className="mr-2" />
                          Rename
                        </ListboxOption>
                        <ListboxOption
                          className="flex items-center px-3 py-2 cursor-pointer border-b border-[hsla(0,0%,100%,.15)] hover:bg-[#444] text-sm"
                          value="share"
                          onClick={() => {
                            handleArchive(chat._id);
                          }}
                        >
                          <RiArchive2Line className="mr-2" />
                          Archive
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
      className={`fixed h-full transition-all duration-300 ease-in-out text-[#bbb] px-4 py-2 z-40 flex flex-col flex-shrink-0 ${
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
                  className="font-semibold flex gap-2 items-center hover:bg-[#1c1c1c] hover:rounded-lg p-2 -ml-2"
                >
                  <div className="rounded-full border border-[hsla(0,0%,100%,.5)]">
                    <Image
                      src="/logo_image.png"
                      height={1000}
                      width={1000}
                      className="h-5 w-5 object-cover object-center"
                      alt="logo"
                    />
                  </div>
                  MyGPT
                </Link>
              </li>

              {user && (
                <div className="mt-3">
                  {categorizedChats.today.length > 0 &&
                    renderChats(categorizedChats.today, "Today")}
                  {categorizedChats.yesterday.length > 0 &&
                    renderChats(categorizedChats.yesterday, "Yesterday")}
                  {categorizedChats.last7days.length > 0 &&
                    renderChats(categorizedChats.last7days, "Previous 7 days")}
                  {categorizedChats.last30days.length > 0 &&
                    renderChats(
                      categorizedChats.last30days,
                      "Previous 30 days"
                    )}
                  {categorizedChats.older.length > 0 &&
                    renderChats(categorizedChats.older, "Older")}
                </div>
              )}
            </ul>
          </div>
        )}
      </div>

      {sidebarOpen && (
        <div className="mt-auto">
          <hr className="border-gray-600 mb-2" />
          {user ? (
            <button
              className="flex items-center justify-center focus-visible:outline-0 gap-2 my-3"
              onClick={() => setIsOpen(true)}
            >
              <div className="w-10 h-10 flex items-center justify-center overflow-hidden rounded-full  hover:bg-[#2f2f2f] focus-visible:bg-[#2f2f2f]">
                <div className="w-8 h-8 relative flex">
                  {user?.profileImage ? (
                    <Image
                      width={32}
                      height={32}
                      src={user?.profileImage?.url}
                      alt={user?.username}
                      className="rounded-full"
                    />
                  ) : (
                    <Image
                      width={32}
                      height={32}
                      src={"/profile.png"}
                      alt={user?.username}
                      className="rounded-full"
                    />
                  )}
                </div>
              </div>
              <div className="flex flex-col items-start">
                <span className="text-sm">{user.username}</span>
                <span className="text-xs text-[#aaa]">{user.email}</span>
              </div>
            </button>
          ) : (
            <button className="p-3">
              <div
                onClick={() => setLogin(true)}
                className="text-sm font-semibold text-gray-900 dark:text-white cursor-pointer"
              >
                <span>Log in &rarr;</span>
              </div>
            </button>
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
        refetch={refetch}
        refetchChats={refetchChats}
      />
      <ShareDialog
        shareOpen={shareOpen}
        setShareOpen={setShareOpen}
        handleCreateLink={handleCreateLink}
        shareLink={shareLink}
        setShareLink={setShareLink}
        linkCreated={linkCreated}
        setLinkCreated={setLinkCreated}
        setIsOpen={setIsOpen}
      />
    </div>
  );
};

export default Sidebar;
