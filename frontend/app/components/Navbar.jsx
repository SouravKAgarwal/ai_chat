import { TbLayoutSidebarFilled } from "react-icons/tb";
import { HiOutlinePencilAlt } from "react-icons/hi";
import { ChevronDownIcon, ShareIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useLogoutQuery } from "@/redux/features/auth/authApi";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import Login from "./auth/Login";
import Register from "./auth/Register";
import SettingsModal from "./profile/Settings";
import Link from "next/link";

const Navbar = ({ sidebarOpen, toggleSidebar }) => {
  const [userLogout, setUserLogout] = useState(false);
  const [login, setLogin] = useState(false);
  const [register, setRegister] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const { user } = useSelector((state) => state.auth);

  const { isSuccess } = useLogoutQuery(undefined, {
    skip: !userLogout,
  });

  useEffect(() => {
    if (isSuccess) {
      setUserLogout(false);
      toast.success("Logged out successfully!");
    }
  }, [isSuccess]);

  return (
    <>
      <div className="sticky top-0 p-3 mb-1.5 flex items-center justify-between z-10 h-14 font-semibold bg-[#212121]">
        <div className="absolute start-1/2 ltr:translate-x-1/2 rtl:translate-x-1/2"></div>
        <div className="flex items-center gap-0 overflow-hidden">
          {!sidebarOpen && (
            <div className="flex items-center">
              <span className="flex">
                <button
                  className="h-10 rounded-lg px-2 text-[#b4b4b4] focus-visible:outline-0 disabled:text-[#676767] focus-visible:bg-[#212121] enabled:hover:bg-[#212121]"
                  onClick={toggleSidebar}
                >
                  <TbLayoutSidebarFilled className="w-6 h-6" />
                </button>
              </span>
              <span className="flex">
                <Link
                  href="/"
                  className="rounded-lg px-2 text-[#b4b4b4] focus-visible:outline-0 disabled:text-[#676767] focus-visible:bg-[#212121] enabled:hover:bg-[#212121]"
                  onClick={toggleSidebar}
                >
                  <HiOutlinePencilAlt className="w-6 h-6" />
                </Link>
              </span>
            </div>
          )}
          <button className="group flex cursor-pointer items-center gap-1 rounded-lg py-1.5 px-3 text-lg hover:bg-[#2f2f2f] font-semibold text-[#b4b4b4] overflow-hidden whitespace-nowrap">
            <div className="text-[#b4b4b4] font-semibold">ChatGPT</div>
            <ChevronDownIcon className="w-4 h-4" />
          </button>
        </div>
        <div className="gap-2 flex items-center pr-1 leading-[0]">
          {location.pathname !== "/" && (
            <button className="hidden md:block relative text-[#ececec] bg-[#212121] border font-[500] border-[hsla(0,0%,100%,.15)] rounded-full text-sm px-3 py-2">
              <div className="flex w-full items-center justify-center gap-1.5">
                <ShareIcon className="w-4 h-4" />
                Share
              </div>
            </button>
          )}
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
        </div>
      </div>
      {(login || register || isOpen) && (
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
    </>
  );
};

export default Navbar;
