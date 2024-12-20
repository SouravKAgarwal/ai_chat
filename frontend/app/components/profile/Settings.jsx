import { useEffect, useState } from "react";
import {
  Description,
  Dialog,
  DialogPanel,
  DialogTitle,
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import { HiOutlineXMark } from "react-icons/hi2";
import { MdSettings, MdPerson, MdSecurity } from "react-icons/md";
import { IoMdBrush } from "react-icons/io";
import {
  BsChat,
  BsDatabaseFillGear,
  BsSoundwave,
  BsThreeDots,
} from "react-icons/bs";
import { useTheme } from "next-themes";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { RiInboxUnarchiveLine, RiLinkM } from "react-icons/ri";
import { BiTrash } from "react-icons/bi";
import dayjs from "dayjs";
import Link from "next/link";
import {
  useArchiveChatMutation,
  useDeleteAllChatsMutation,
  useDeleteShareChatMutation,
  useGetArchivedChatsQuery,
  useUnArchiveChatMutation,
} from "@/redux/features/chat/chatApi";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { AiOutlineCamera } from "react-icons/ai";
import { useUpdateAvatarMutation } from "@/redux/features/user/userApi";
import { toast } from "sonner";

const Confirmation = ({ action, isOpen, onClose, onConfirm }) => {
  return (
    <Dialog open={isOpen} onClose={onClose}>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <DialogPanel className="bg-white dark:bg-[#2d2c2c] text-black dark:text-[#d5d5d5] rounded-2xl shadow-lg w-full max-w-md">
          <div className="flex justify-between items-center p-4 px-6 border-b dark:border-[#444]">
            <DialogTitle className="text-lg font-medium my-[.25rem] first:mt-[.25rem]">
              Confirm {action.charAt(0).toUpperCase() + action.slice(1)}
            </DialogTitle>
            <div
              className="cursor-pointer hover:bg-[#666] p-1 rounded-full"
              onClick={onClose}
            >
              <HiOutlineXMark className="w-5 h-5" />
            </div>
          </div>
          <div className="p-4">
            <Description className="text-sm ">
              Are you sure you want to {action} all chats? This action cannot be
              undone.
            </Description>
            <div className="mt-4 flex justify-end gap-4">
              <button
                onClick={onClose}
                className="text-[#ececec] bg-transparent hover:bg-[#343333] border font-[500] border-[hsla(0,0%,100%,.15)] rounded-full text-sm px-3 py-2"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="text-[#ececec] bg-red-500 hover:bg-red-600 border font-[500] border-[hsla(0,0%,100%,.15)] rounded-full text-sm px-3 py-2"
              >
                Confirm
              </button>
            </div>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

const SettingsModal = ({
  isOpen,
  setIsOpen,
  user,
  setUserLogout,
  refetch,
  refetchChats,
}) => {
  const { theme, setTheme } = useTheme();
  const [language, setLanguage] = useState("en");
  const [activeTab, setActiveTab] = useState("general");
  const [manageTab, setManageTab] = useState("");
  const [action, setAction] = useState("");
  const [deletedLink, setDeletedLink] = useState(null);
  const [unarchive, setUnarchive] = useState(null);
  const [openConf, setOpenConf] = useState(false);
  const [archivedChats, setArchivedChats] = useState([]);

  const [deleteShareChat, { isSuccess }] = useDeleteShareChatMutation();
  const [deleteAllChats, { isSuccess: deleteAllChatSuccess }] =
    useDeleteAllChatsMutation();
  const [
    updateAvatar,
    { isSuccess: editSuccess, error: editError, isLoading },
  ] = useUpdateAvatarMutation();
  const { data, refetch: refetchArchivedChats } = useGetArchivedChatsQuery(
    {},
    { refetchOnMountOrArgChange: true }
  );
  const [unArchiveChat, { isSuccess: unArchiveSuccess }] =
    useUnArchiveChatMutation();
  const [archiveChat, { isSuccess: archiveSuccess }] = useArchiveChatMutation();

  const sharedLinks = user?.sharedLinks || [];
  const router = useRouter();

  const handleClose = () => {
    setIsOpen(false);
    setActiveTab("general");
    setManageTab("");
  };

  const logoutHandler = () => {
    setIsOpen(false);
    setUserLogout(true);
  };

  const handleDeleteLinkWithFade = (chatId) => {
    setDeletedLink(chatId);
    setTimeout(async () => {
      await deleteShareChat(chatId);
    }, 200);
  };

  const handleUnarchiveWithFade = (chatId) => {
    setUnarchive(chatId);
    setTimeout(async () => {
      await unArchiveChat(chatId);
    }, 200);
  };

  const delAllChats = async () => await deleteAllChats();
  const archiveAllChats = async () => await archiveChat();

  useEffect(() => {
    if (isSuccess) {
      refetch();
      setDeletedLink(null);
    }
    if (deleteAllChatSuccess) {
      refetch();
      router.push("/");
    }
    if (unArchiveSuccess) {
      refetchChats();
      refetchArchivedChats();
      setUnarchive(null);
    }
    if (archiveSuccess) {
      refetchChats();
      refetchArchivedChats();
    }
  }, [isSuccess, deleteAllChatSuccess, unArchiveSuccess, archiveSuccess]);

  useEffect(() => {
    if (data && data.archivedChats) {
      setArchivedChats(data.archivedChats);
    }
  }, [data]);

  const imageHandler = (e) => {
    const file = new FileReader();

    file.onload = () => {
      const avatar = file.result;
      if (file.readyState === 2) {
        updateAvatar(avatar);
      }
    };
    file.readAsDataURL(e.target.files[0]);
  };

  useEffect(() => {
    if (editSuccess) {
      refetch();
      toast.success("Profile updated successfully");
    }
    if (editError) {
      toast.error(editError.data.message);
    }
  }, [editSuccess, editError]);

  const tabs = [
    { id: "general", label: "General", icon: <MdSettings /> },
    { id: "profile", label: "Profile", icon: <MdPerson /> },
    { id: "preferences", label: "Preferences", icon: <IoMdBrush /> },
    {
      id: "data-controls",
      label: "Data controls",
      icon: <BsDatabaseFillGear />,
    },
    { id: "security", label: "Security", icon: <MdSecurity /> },
  ];

  const generalSettings = [
    {
      label: "Theme",
      control: (
        <div className="relative">
          <Listbox value={theme} onChange={setTheme}>
            <ListboxButton className="relative block w-full py-1.5 pr-8 pl-3 text-left text-sm text-black dark:text-white outline-none">
              {theme === "light" ? "Light" : "Dark"}
              <ChevronDownIcon className="pointer-events-none absolute top-2.5 right-2.5 h-3 w-3 text-black dark:text-white" />
            </ListboxButton>

            <ListboxOptions className="absolute z-30 mt-1 rounded-lg bg-[#222] p-1 focus:outline-none transition-opacity duration-150 ease-in-out">
              {/* <ListboxOption
                value="light"
                className={({ active, selected }) =>
                  `flex w-20 cursor-pointer items-center gap-2 rounded-lg py-1.5 px-3 ${
                    active ? "bg-[#333] text-white" : "text-white"
                  }`
                }
              >
                {({ selected }) => <span>Light</span>}
              </ListboxOption> */}

              <ListboxOption
                value="dark"
                className={({ active, selected }) =>
                  `flex w-20 cursor-pointer items-center gap-2 rounded-lg py-1.5 px-3 ${
                    active ? "bg-[#333] text-white" : "text-white"
                  }`
                }
              >
                {({ selected }) => <span>Dark</span>}
              </ListboxOption>
            </ListboxOptions>
          </Listbox>
        </div>
      ),
    },
    {
      label: "Language",
      control: (
        <div className="relative">
          <Listbox
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <ListboxButton className="relative block w-full py-1.5 pr-8 pl-3 text-left text-sm text-black dark:text-white outline-none">
              {language === "en" && "English"}
              <ChevronDownIcon className="pointer-events-none absolute top-2.5 right-2.5 h-3 w-3 text-black dark:text-white" />
            </ListboxButton>

            <ListboxOptions className="absolute z-30 mt-1 rounded-lg bg-[#222] p-1 focus:outline-none transition-opacity duration-150 ease-in-out">
              <ListboxOption
                value="en"
                className={({ active, selected }) =>
                  `flex w-20 cursor-pointer items-center gap-2 rounded-lg py-1.5 px-3 ${
                    active ? "bg-[#333] text-white" : "text-white"
                  }`
                }
              >
                {({ selected }) => <span>English</span>}
              </ListboxOption>
            </ListboxOptions>
          </Listbox>
        </div>
      ),
    },
    {
      label: "Archived Chats",
      control: (
        <button
          onClick={() => setManageTab("archived-chats")}
          className="text-[#ececec] bg-transparent border font-[500] border-[hsla(0,0%,100%,.15)] rounded-full text-sm px-3 py-2"
        >
          Manage
        </button>
      ),
    },
    {
      label: "Archive all chats",
      control: (
        <button
          className="text-[#ececec] bg-transparent border font-[500] border-[hsla(0,0%,100%,.15)] rounded-full text-sm px-3 py-2"
          onClick={() => {
            setIsOpen(false);
            setAction("archive");
            setOpenConf(true);
          }}
        >
          Archive All
        </button>
      ),
    },
    {
      label: "Delete all chats",
      control: (
        <button
          className="text-[#ececec] bg-red-500 border font-[500] border-[hsla(0,0%,100%,.15)] rounded-full text-sm px-3 py-2 hover:bg-red-600"
          onClick={() => {
            setIsOpen(false);
            setAction("delete");
            setOpenConf(true);
          }}
        >
          Delete All
        </button>
      ),
    },
    {
      label: "Log out on this device",
      control: (
        <button
          className="text-[#ececec] bg-transparent border font-[500] border-[hsla(0,0%,100%,.15)] rounded-full text-sm px-3 py-2"
          onClick={logoutHandler}
        >
          Logout
        </button>
      ),
    },
  ];

  const profileSettings = [
    {
      label: "Avatar",
      control: (
        <div className="flex items-center justify-center overflow-hidden rounded-full">
          <div className="relative flex">
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-t-transparent border-slate-500 rounded-full animate-spin"></div>
            ) : user?.profileImage ? (
              <Image
                width={3200}
                height={3200}
                src={user?.profileImage?.url}
                alt={user?.username}
                className="w-8 h-8 rounded-sm"
              />
            ) : (
              <Image
                width={32}
                height={32}
                src={"/profile.png"}
                alt={user?.username}
                className="rounded-sm"
              />
            )}
          </div>
          <input
            id="avatar"
            type="file"
            className="hidden"
            onChange={imageHandler}
            accept="image/png, image/jpg,image/jpeg,image/webp"
          />
          {!isLoading && (
            <label htmlFor="avatar">
              <div className="w-5 h-5 bg-slate-900 rounded-full mt-1 absolute right-3 flex items-center justify-center cursor-pointer">
                <AiOutlineCamera size={16} className="z-1 text-white" />
              </div>
            </label>
          )}
        </div>
      ),
    },
    { label: "Username", value: user?.username },
    { label: "Email", value: user?.email },
    { label: "Last Login", value: new Date(user?.lastLogin).toLocaleString() },
    {
      control: (
        <button className="relative block rounded-lg text-center text-sm px-4 py-2 outline-none bg-black dark:bg-white/5 text-white">
          Edit
        </button>
      ),
    },
  ];

  const dataControlSettings = [
    {
      label: "Shared Links",
      control: (
        <button
          onClick={() => setManageTab("shared-link")}
          className="text-[#ececec] bg-transparent border font-[500] border-[hsla(0,0%,100%,.15)] rounded-full text-sm px-3 py-2"
        >
          Manage
        </button>
      ),
    },
    {
      label: "Export Data",
      control: (
        <button className="text-[#ececec] bg-transparent border font-[500] border-[hsla(0,0%,100%,.15)] rounded-full text-sm px-3 py-2">
          Export
        </button>
      ),
    },
    {
      label: "Delete Account",
      control: (
        <button className="text-[#ececec] border font-[500] border-[hsla(0,0%,100%,.15)] rounded-full text-sm px-3 py-2 bg-red-500 hover:bg-red-600">
          Delete
        </button>
      ),
    },
  ];

  const renderSharedLinksDialog = () => {
    const sortedLinks = [...sharedLinks].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    return (
      <Dialog
        open={manageTab === "shared-link"}
        onClose={() => setManageTab("")}
      >
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <DialogPanel className="relative bg-white dark:bg-[#2d2c2c] text-black dark:text-[#d5d5d5] rounded-2xl shadow-lg w-full max-w-2xl">
            <div className="flex justify-between items-center p-4 border-b dark:border-[hsla(0,0%,100%,.1)]">
              <DialogTitle className="text-lg font-medium my-[.25rem] first:mt-[.25rem]">
                Shared Links
              </DialogTitle>
              <div
                className="cursor-pointer hover:bg-[#666] p-1 rounded-full"
                onClick={() => setManageTab("")}
              >
                <HiOutlineXMark className="w-5 h-5" />
              </div>
            </div>
            <>
              {sortedLinks.length > 0 ? (
                <div className="flex-grow overflow-y-auto p-4 sm:p-6">
                  <div className="overflow-y-auto hide-scrollbar text-sm h-80">
                    <table className="w-full border-separate border-spacing-0">
                      <thead>
                        <tr>
                          <th className="border-x-0 border-t-0 border-b-[0.5px] border-[hsla(0,0%,100%,.15)] bg-transparent py-2 font-semibold pr-4 last:pr-0 text-left">
                            Name
                          </th>
                          <th className="border-x-0 border-t-0 border-b-[0.5px] border-[hsla(0,0%,100%,.15)] bg-transparent py-2 font-semibold pr-4 last:pr-0 text-left">
                            Date shared
                          </th>
                          <th className="border-x-0 border-t-0 border-b-[0.5px] border-[hsla(0,0%,100%,.15)] bg-transparent py-2 font-semibold pr-4 last:pr-4 last:border-r-0 text-right">
                            <button>
                              <BsThreeDots />
                            </button>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedLinks.map((link, index) => (
                          <tr key={link.chatId}>
                            <td
                              className={`border-x-0 border-t-0 border-[hsla(0,0%,100%,.1)] align-top pr-4 text-left ${
                                deletedLink === link.chatId
                                  ? "text-white/50"
                                  : ""
                              } ${
                                index === sortedLinks.length - 1
                                  ? "border-b-0"
                                  : "border-b-[0.5px]"
                              }`}
                            >
                              <div className="flex min-h-[40px] items-center">
                                <Link
                                  href={link.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className={`inline-flex items-center gap-2 align-top ${
                                    deletedLink === link.chatId
                                      ? "text-white/50"
                                      : "text-blue-500 dark:text-blue-400"
                                  } underline`}
                                >
                                  <RiLinkM className="w-5 h-5" />
                                  {link.title}
                                </Link>
                              </div>
                            </td>
                            <td
                              className={`border-x-0 border-t-0 border-[hsla(0,0%,100%,.1)] align-top pr-4 text-left ${
                                deletedLink === link.chatId
                                  ? "text-white/50"
                                  : ""
                              } ${
                                index === sortedLinks.length - 1
                                  ? "border-b-0"
                                  : "border-b-[0.5px]"
                              }`}
                            >
                              <div className="flex min-h-[40px] items-center">
                                {dayjs(link.createdAt).format("MMMM D, YYYY")}
                              </div>
                            </td>
                            <td
                              className={`border-x-0 border-t-0 border-[hsla(0,0%,100%,.1)] align-top pr-4 text-right last:border-r-0 ${
                                deletedLink === link.chatId
                                  ? "text-white/50"
                                  : ""
                              } ${
                                index === sortedLinks.length - 1
                                  ? "border-b-0"
                                  : "border-b-[0.5px]"
                              }`}
                            >
                              <div className="flex justify-end min-h-[40px] items-center">
                                <div className="text-md flex items-center justify-end gap-2">
                                  <button
                                    onClick={() =>
                                      handleDeleteLinkWithFade(link.chatId)
                                    }
                                  >
                                    <BiTrash className="w-5 h-5" />
                                  </button>
                                </div>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="p-4 text-sm h-80">
                  No shared links available.
                </div>
              )}
            </>
          </DialogPanel>
        </div>
      </Dialog>
    );
  };

  const renderArchivedChatsDialog = () => {
    const sortedLinks = [...archivedChats].sort(
      (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
    );

    return (
      <Dialog
        open={manageTab === "archived-chats"}
        onClose={() => setManageTab("")}
      >
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <DialogPanel className="relative bg-white dark:bg-[#2d2c2c] text-black dark:text-[#d5d5d5] rounded-2xl shadow-lg w-full max-w-2xl">
            <div className="flex justify-between items-center p-4 border-b dark:border-[hsla(0,0%,100%,.1)]">
              <DialogTitle className="text-lg font-medium my-[.25rem] first:mt-[.25rem]">
                Archived Chats
              </DialogTitle>
              <div
                className="cursor-pointer hover:bg-[#666] p-1 rounded-full"
                onClick={() => setManageTab("")}
              >
                <HiOutlineXMark className="w-5 h-5" />
              </div>
            </div>
            <>
              {sortedLinks.length > 0 ? (
                <div className="flex-grow overflow-y-auto p-4 sm:p-6">
                  <div className="overflow-y-auto hide-scrollbar text-sm h-96">
                    <table className="w-full border-separate border-spacing-0">
                      <thead>
                        <tr>
                          <th className="border-x-0 border-t-0 border-b-[0.5px] border-[hsla(0,0%,100%,.15)] bg-transparent py-2 font-semibold pr-4 last:pr-0 text-left">
                            Name
                          </th>
                          <th className="border-x-0 border-t-0 border-b-[0.5px] border-[hsla(0,0%,100%,.15)] bg-transparent py-2 font-semibold pr-4 last:pr-0 text-left">
                            Date created
                          </th>
                          <th className="border-x-0 border-t-0 border-b-[0.5px] border-[hsla(0,0%,100%,.15)] bg-transparent py-2 font-semibold pr-4 last:pr-4 last:border-r-0 text-right">
                            <button>
                              <BsThreeDots />
                            </button>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedLinks.map((link, index) => (
                          <tr key={link._id}>
                            <td
                              className={`border-x-0 border-t-0 border-[hsla(0,0%,100%,.1)] align-top pr-4 text-left ${
                                unarchive === link.chatId ? "text-white/50" : ""
                              } ${
                                index === sortedLinks.length - 1
                                  ? "border-b-0"
                                  : "border-b-[0.5px]"
                              }`}
                            >
                              <div className="flex min-h-[40px] items-center">
                                <Link
                                  href={`/chat/${link._id}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className={`inline-flex items-center gap-2 align-top ${
                                    unarchive === link._id
                                      ? "text-white/50"
                                      : "text-blue-500 dark:text-blue-400"
                                  }`}
                                >
                                  <BsChat className="w-5 h-5" />
                                  {link.title}
                                </Link>
                              </div>
                            </td>
                            <td
                              className={`border-x-0 border-t-0 border-[hsla(0,0%,100%,.1)] align-top pr-4 text-left ${
                                unarchive === link._id ? "text-white/50" : ""
                              } ${
                                index === sortedLinks.length - 1
                                  ? "border-b-0"
                                  : "border-b-[0.5px]"
                              }`}
                            >
                              <div className="flex min-h-[40px] items-center">
                                {dayjs(link.createdAt).format("MMMM D, YYYY")}
                              </div>
                            </td>
                            <td
                              className={`border-x-0 border-t-0 border-[hsla(0,0%,100%,.1)] align-top pr-4 text-right last:border-r-0 ${
                                unarchive === link._id ? "text-white/50" : ""
                              } ${
                                index === sortedLinks.length - 1
                                  ? "border-b-0"
                                  : "border-b-[0.5px]"
                              }`}
                            >
                              <div className="flex justify-end min-h-[40px] items-center">
                                <div className="text-md flex items-center justify-end gap-2">
                                  <button
                                    onClick={() =>
                                      handleUnarchiveWithFade(link._id)
                                    }
                                  >
                                    <RiInboxUnarchiveLine className="w-5 h-5" />
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleDeleteLinkWithFade(link._id)
                                    }
                                  >
                                    <BiTrash className="w-5 h-5" />
                                  </button>
                                </div>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="p-4 text-sm h-[360px]">
                  No archived chats available.
                </div>
              )}
            </>
          </DialogPanel>
        </div>
      </Dialog>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "general":
        return (
          <div className="flex flex-col">
            {generalSettings.map((setting, index) => (
              <div
                key={index}
                className="flex justify-between items-center text-sm py-2.5 border-b border-[hsla(0,0%,100%,.1)] last:border-none first:pt-0"
              >
                <span>{setting.label}</span>
                {setting.control}
              </div>
            ))}
          </div>
        );
      case "profile":
        return (
          <div className="flex flex-col">
            {profileSettings.map((setting, index) => (
              <div
                key={index}
                className="flex justify-between items-center text-sm py-2.5 border-b border-[hsla(0,0%,100%,.1)] last:border-none first:pt-0"
              >
                <span>{setting.label}</span>
                <span className="p-1">{setting.value}</span>
                {setting.control}
              </div>
            ))}
          </div>
        );
      case "data-controls":
        return (
          <div className="flex flex-col">
            {dataControlSettings.map((setting, index) => (
              <div
                key={index}
                className="flex justify-between items-center text-sm py-2.5 border-b border-[hsla(0,0%,100%,.1)] last:border-none first:pt-0"
              >
                <span>{setting.label}</span>
                <div>
                  {setting.control}
                  <span className="text-black dark:text-white p-1">
                    {setting.value}
                  </span>
                </div>
              </div>
            ))}
          </div>
        );
      default:
        return (
          <div className="flex justify-center items-center h-full select-none">
            Coming Soon
          </div>
        );
    }
  };

  return (
    <>
      <Dialog open={isOpen} onClose={handleClose}>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <DialogPanel className="relative bg-white dark:bg-[#2d2c2c] text-black dark:text-[#d5d5d5] rounded-2xl shadow-lg w-full max-w-2xl min-h-96">
            <div className="flex justify-between items-center p-4 px-6 border-b dark:border-[#444]">
              <DialogTitle className="text-lg font-medium my-[.25rem] first:mt-[.25rem]">
                Settings
              </DialogTitle>
              <div
                className="cursor-pointer hover:bg-[#666] p-1 rounded-full"
                onClick={handleClose}
              >
                <HiOutlineXMark className="w-5 h-5" />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row">
              <div className="w-full sm:w-[28%] p-4">
                <div className="flex flex-wrap md:flex-col gap-3 md:gap-0">
                  {tabs.map((tab) => (
                    <div
                      key={tab.id}
                      className={`flex items-center p-2 rounded-lg text-sm cursor-pointer ${
                        activeTab === tab.id
                          ? "bg-[#424242] text-[#d5d5d5]"
                          : "bg-transparent"
                      }`}
                      onClick={() => setActiveTab(tab.id)}
                    >
                      {tab.icon}
                      <span className="ml-2">{tab.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="w-full sm:w-[72%] p-4">{renderTabContent()}</div>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
      {renderSharedLinksDialog()}
      {renderArchivedChatsDialog()}
      {openConf && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-70" />
      )}
      {openConf && (
        <Confirmation
          action={action}
          isOpen={openConf}
          onClose={() => {
            setOpenConf(false);
            setAction("");
          }}
          onConfirm={() => {
            action === "delete" ? delAllChats() : archiveAllChats();
            setOpenConf(false);
            setAction("");
          }}
        />
      )}
    </>
  );
};

export default SettingsModal;
