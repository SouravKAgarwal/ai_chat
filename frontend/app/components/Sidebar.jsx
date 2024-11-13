import removeMarkdown from "markdown-to-text";
import Link from "next/link";
import { BiMenuAltRight } from "react-icons/bi";
import { FaRainbow } from "react-icons/fa";
import { HiMiniPencilSquare } from "react-icons/hi2";
import { CgTrashEmpty } from "react-icons/cg";
import SettingsModal from "./profile/Settings";
import { useEffect, useState } from "react";
import Login from "./auth/Login";
import Register from "./auth/Register";
import { useLogoutQuery } from "@/redux/features/auth/authApi";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { categorizeChatsByDate } from "../utils";

const Sidebar = ({
  sidebarOpen,
  toggleSidebar,
  conversation,
  isLoading,
  handleDelete,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [login, setLogin] = useState(false);
  const [register, setRegister] = useState(false);
  const [userLogout, setUserLogout] = useState(false);

  const categorizedChats = categorizeChatsByDate(conversation);
  const { user } = useSelector((state) => state.auth);
  const { isSuccess } = useLogoutQuery(undefined, { skip: !userLogout });

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
            <div className="pl-2">
              <CgTrashEmpty
                size={20}
                className={`cursor-pointer ${
                  location.pathname === `/chat/${chat._id}`
                    ? "visible"
                    : "invisible group-hover:visible"
                }`}
                onClick={() => handleDelete(chat._id)}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div
      className={`fixed h-full transition-all duration-300 ease-in-out text-[#bbb] px-4 py-2 z-50 flex flex-col ${
        sidebarOpen ? "w-full sm:w-48 md:w-64 bg-[#121212]" : ""
      }`}
    >
      {sidebarOpen && (
        <div className="flex justify-between gap-4 items-center mb-4 px-2">
          <button onClick={toggleSidebar} className="text-[#ccc]">
            <BiMenuAltRight size={24} />
          </button>
          <Link
            href="/"
            className="text-[#ccc] hover:bg-[#222] rounded-lg p-2"
            onClick={handleLinkClick}
          >
            <HiMiniPencilSquare size={20} />
          </Link>
        </div>
      )}

      <div className="overflow-y-auto hide-scrollbar flex-grow">
        {sidebarOpen && (
          <div>
            <ul className="gap-3 list-none -ml-4">
              <li className="py-2">
                <Link
                  href="/"
                  onClick={handleLinkClick}
                  className="font-semibold flex gap-2 items-center"
                >
                  <FaRainbow size={16} />
                  MyGPT
                </Link>
              </li>

              <div className="mt-5">
                {isLoading ? (
                  <div className="loading-dots px-2">
                    <div className="dot"></div>
                    <div className="dot"></div>
                    <div className="dot"></div>
                  </div>
                ) : (
                  <>
                    {categorizedChats.today.length > 0 &&
                      renderChats(categorizedChats.today, "Today")}
                    {categorizedChats.yesterday.length > 0 &&
                      renderChats(categorizedChats.yesterday, "Yesterday")}
                    {categorizedChats.last7days.length > 0 &&
                      renderChats(
                        categorizedChats.last7days,
                        "Previous 7 days"
                      )}
                    {categorizedChats.last30days.length > 0 &&
                      renderChats(
                        categorizedChats.last30days,
                        "Previous 30 days"
                      )}
                    {categorizedChats.older.length > 0 &&
                      renderChats(categorizedChats.older, "Older")}
                  </>
                )}
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
            <button
              onClick={() => setLogin(true)}
              className="text-sm font-semibold text-gray-900 dark:text-white cursor-pointer"
            >
              <span>Log in &rarr;</span>
            </button>
          )}
        </div>
      )}

      {isOpen && <div className="fixed inset-0 z-40 bg-black bg-opacity-70" />}
      <SettingsModal
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        user={user}
        setUserLogout={setUserLogout}
      />
      {(login || register || isOpen) && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-70" />
      )}
      <Login login={login} setLogin={setLogin} setRegister={setRegister} />
      <Register
        registered={register}
        setLogin={setLogin}
        setRegister={setRegister}
      />
    </div>
  );
};

export default Sidebar;
