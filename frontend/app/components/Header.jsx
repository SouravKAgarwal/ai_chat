import Image from "next/image";
import { useEffect, useState } from "react";
import SettingsModal from "./profile/Settings";
import { BiMenuAltRight } from "react-icons/bi";
import { HiMiniPencilSquare } from "react-icons/hi2";
import Link from "next/link";
import { useLogoutQuery } from "@/redux/features/auth/authApi";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import Login from "./auth/Login";
import Register from "./auth/Register";
import removeMarkdown from "markdown-to-text";

const Header = ({ title, toggleSidebar }) => {
  const [userLogout, setUserLogout] = useState(false);
  const [login, setLogin] = useState(false);
  const [register, setRegister] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(true);

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

  useEffect(() => {
    if (user) {
      setMounted(true);
    }
  }, [user]);

  if (mounted) {
    return (
      <div className="fixed top-0 left-0 right-0 w-full z-30 bg-[#e8e3e3] dark:bg-[#2f2f2f]">
        <header className="flex items-center justify-between px-6 py-2">
          <div className="flex items-center space-x-2">
            <button
              className="text-gray-600 dark:text-[#ccc]"
              onClick={toggleSidebar}
            >
              <BiMenuAltRight size={24} />
            </button>
            <Link
              href="/"
              className="flex items-center text-gray-600 dark:text-[#ccc] hover:bg-[#222] rounded-lg p-2"
            >
              <HiMiniPencilSquare size={20} />
            </Link>
          </div>

          <div className="flex justify-center sm:justify-start">
            <span className="text-lg font-semibold block text-gray-900 dark:text-[#b4b4b4]">
              MyGPT
            </span>
          </div>

          <div className="w-full flex-1 sm:flex hidden sm:justify-center">
            <span className="text-lg font-semibold sm:block hidden text-gray-900 dark:text-[#b4b4b4]">
              {removeMarkdown(title).trimEnd()}
            </span>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <div onClick={() => setIsOpen(true)} className="cursor-pointer">
                <Image
                  width={32}
                  height={32}
                  src={user?.profileImage?.url}
                  alt={user?.username}
                  className="w-8 h-8 rounded-full"
                />
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
        </header>

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
      </div>
    );
  }
};

export default Header;
