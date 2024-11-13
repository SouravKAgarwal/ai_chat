import React, { useState } from "react";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import { HiOutlineXMark } from "react-icons/hi2";
import { MdSettings, MdPerson, MdMic, MdSecurity } from "react-icons/md";
import { IoMdBrush } from "react-icons/io";
import { useTheme } from "next-themes";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

const SettingsModal = ({ isOpen, setIsOpen, user, setUserLogout }) => {
  const { theme, setTheme } = useTheme();
  const [language, setLanguage] = useState("en");
  const [activeTab, setActiveTab] = useState("general");

  const logoutHandler = () => {
    setIsOpen(false);
    setUserLogout(true);
  };

  const tabs = [
    { id: "general", label: "General", icon: <MdSettings /> },
    { id: "profile", label: "Profile", icon: <MdPerson /> },
    { id: "preferences", label: "Preferences", icon: <IoMdBrush /> },
    { id: "speech", label: "Speech", icon: <MdMic /> },
    { id: "security", label: "Security", icon: <MdSecurity /> },
  ];

  const generalSettings = [
    {
      label: "Theme",
      control: (
        <div className="relative">
          <Listbox value={theme} onChange={setTheme}>
            <ListboxButton className="relative block w-full rounded-lg bg-[#2d2c2c] py-1.5 pr-8 pl-3 text-left text-sm text-white outline-none">
              {theme === "light" ? "Light" : "Dark"}
              <ChevronDownIcon className="pointer-events-none absolute top-2.5 right-2.5 h-3 w-3 text-white" />
            </ListboxButton>

            <ListboxOptions className="absolute z-30 mt-1 rounded-lg bg-[#222] p-1 focus:outline-none transition-opacity duration-150 ease-in-out">
              <ListboxOption
                value="light"
                className={({ active, selected }) =>
                  `flex w-20 cursor-pointer items-center gap-2 rounded-lg py-1.5 px-3 ${
                    active ? "bg-[#333] text-white" : "text-white"
                  }`
                }
              >
                {({ selected }) => <span>Light</span>}
              </ListboxOption>

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
            <ListboxButton className="relative block w-full rounded-lg bg-[#2d2c2c] py-1.5 pr-8 pl-3 text-left text-sm text-white outline-none">
              {language === "en" && "English"}
              <ChevronDownIcon className="pointer-events-none absolute top-2.5 right-2.5 h-3 w-3 text-white" />
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
      control: (
        <button
          className="relative block rounded-lg text-center text-sm px-3 py-1.5 outline-none bg-red-500 text-white hover:bg-red-600"
          onClick={logoutHandler}
        >
          Logout
        </button>
      ),
    },
  ];

  const profileSettings = [
    { label: "Username", value: user?.username },
    { label: "Email", value: user?.email },
    {
      label: "Subscription",
      value:
        user?.subscription?.plan[0].toUpperCase() +
        user?.subscription?.plan.slice(1),
    },
    { label: "Last Login", value: new Date(user?.lastLogin).toLocaleString() },
    {
      control: (
        <button className="relative block rounded-lg text-center text-sm px-4 py-2 outline-none bg-white/5 text-white">
          Edit
        </button>
      ),
    },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "general":
        return (
          <div className="flex flex-col">
            {generalSettings.map((setting, index) => (
              <div
                key={index}
                className="flex justify-between items-center text-sm py-3 border-b border-[#666] last:border-none first:pt-0"
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
                className="flex justify-between items-center text-sm py-3 border-b border-[#666] last:border-none first:pt-0"
              >
                <span>{setting.label}</span>
                <span className="text-white p-1">{setting.value}</span>
                {setting.control}
              </div>
            ))}
          </div>
        );
      case "preferences":
        return <div>Personalization settings content</div>;
      case "speech":
        return <div>Speech settings content</div>;
      case "security":
        return <div>Security settings content</div>;
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onClose={() => setIsOpen(false)}>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <DialogPanel className="relative bg-[#2d2c2c] text-gray-300 rounded-2xl shadow-lg w-full max-w-2xl min-h-96">
          <div className="flex justify-between items-center p-4 px-6 border-b border-[#666]">
            <DialogTitle className="text-lg font-medium leading-6">
              Settings
            </DialogTitle>
            <div
              className="cursor-pointer hover:bg-[#666] p-1 rounded-full"
              onClick={() => setIsOpen(false)}
            >
              <HiOutlineXMark className="w-5 h-5" />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row">
            <div className="w-full sm:w-1/4 p-4">
              <div className="flex flex-wrap md:flex-col gap-3 md:gap-0 item-start">
                {tabs.map((tab) => (
                  <div
                    key={tab.id}
                    className={`flex items-center p-2 rounded-lg text-sm cursor-pointer ${
                      activeTab === tab.id ? "bg-[#424242]" : "bg-transparent"
                    }`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    {tab.icon}
                    <span className="ml-2">{tab.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="w-full sm:w-3/4 p-4">
              <div>{renderTabContent()}</div>
            </div>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default SettingsModal;
