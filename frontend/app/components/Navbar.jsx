import { TbLayoutSidebarFilled } from "react-icons/tb";
import { HiOutlinePencilAlt } from "react-icons/hi";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useLogoutQuery } from "@/redux/features/auth/authApi";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import Login from "./auth/Login";
import Register from "./auth/Register";
import SettingsModal from "./profile/Settings";
import Link from "next/link";
import { FiShare } from "react-icons/fi";
import { useShareChatMutation } from "@/redux/features/chat/chatApi";
import ShareDialog from "./chat/ShareDialog";
import { useLoadUserQuery } from "@/redux/features/api/apiSlices";

const Navbar = ({ sidebarOpen, toggleSidebar, chatId }) => {
  const [userLogout, setUserLogout] = useState(false);
  const [login, setLogin] = useState(false);
  const [register, setRegister] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [linkCreated, setLinkCreated] = useState(false);
  const [shareLink, setShareLink] = useState(
    "https://chatai-01.vercel.app/share/..."
  );

  const { user } = useSelector((state) => state.auth);
  const { refetch } = useLoadUserQuery({}, { refetchOnMountOrArgChange: true });

  const [shareChat, { isSuccess: shareChatSuccess }] = useShareChatMutation();
  const { isSuccess } = useLogoutQuery(undefined, {
    skip: !userLogout,
  });

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
  }, [isSuccess, shareChatSuccess]);

  return (
    <>
      <div className="sticky top-0 p-3 mb-1.5 flex items-center justify-between z-10 h-14 font-semibold">
        <div className="absolute start-1/2 ltr:translate-x-1/2 rtl:translate-x-1/2"></div>
        <div className="flex items-center gap-0 overflow-hidden">
          {!sidebarOpen && (
            <div className="flex items-center">
              <span className="flex">
                <button
                  className="rounded-lg p-2 focus-visible:outline-0 hover:bg-[#2f2f2f] disabled:text-[#676767]"
                  onClick={toggleSidebar}
                >
                  <TbLayoutSidebarFilled className="w-6 h-6" />
                </button>
              </span>
              <span className="flex">
                <Link
                  href="/"
                  className="rounded-lg p-2 focus-visible:outline-0 hover:bg-[#2f2f2f] disabled:text-[#676767]"
                  onClick={toggleSidebar}
                >
                  <HiOutlinePencilAlt className="w-6 h-6" />
                </Link>
              </span>
            </div>
          )}
          <button className="group flex cursor-pointer items-center gap-1 rounded-lg py-1.5 px-3 text-lg dark:hover:bg-[#2f2f2f] font-semibold overflow-hidden whitespace-nowrap">
            <div className="font-semibold">MyGPT</div>
            <ChevronDownIcon className="w-4 h-4" />
          </button>
        </div>
        <div className="gap-2 flex items-center pr-1 leading-[0]">
          {location.pathname !== "/" && (
            <button className="hidden md:block relative text-[#ececec] bg-[#212121] border font-[500] border-[hsla(0,0%,100%,.15)] rounded-full text-sm px-3 py-2">
              <div
                className="flex w-full items-center justify-center gap-1.5"
                onClick={() => setShareOpen(true)}
              >
                <FiShare className="w-4 h-4" />
                Share
              </div>
            </button>
          )}
          {user ? (
            <button className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-[#2f2f2f] focus-visible:bg-[#2f2f2f] focus-visible:outline-0">
              <div className="flex items-center justify-center overflow-hidden rounded-full">
                <div className="relative flex" onClick={() => setIsOpen(true)}>
                  <Image
                    width={32}
                    height={32}
                    src={user?.profileImage?.url}
                    alt={user?.username}
                    className="rounded-sm"
                  />
                </div>
              </div>
            </button>
          ) : (
            <button className="flex items-center justify-center outline-0">
              <div
                className="relative flex text-sm"
                onClick={() => setLogin(true)}
              >
                <span>Log in &rarr;</span>
              </div>
            </button>
          )}
        </div>
      </div>
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
    </>
  );
};

export default Navbar;
