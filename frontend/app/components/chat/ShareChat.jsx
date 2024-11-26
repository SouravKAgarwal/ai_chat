import ChatWindow from "./ChatWindow";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

const ShareChat = ({ data }) => {
  const [conversation, setConversation] = useState([]);
  const [title, setTitle] = useState("");

  useEffect(() => {
    if (data?.chat) {
      setConversation(data.chat.conversation);
      setTitle(data.chat.title);
    }
  }, [data]);

  return (
    <div className="flex flex-col h-[100dvh]">
      <div className="grow overflow-y-auto hide-scrollbar bg-[#212121] pt-2">
        <div className="mx-auto flex flex-1 gap-4 text-base md:gap-5 lg:gap-6 md:max-w-3xl lg:max-w-[40rem] xl:max-w-[48rem]">
          <div className="w-full border-b border-gray-100 px-4 pb-4 pt-3 sm:mb-2 sm:pb-6 sm:pt-8 md:px-0">
            <h1 className="text-3xl font-semibold leading-tight text-[#b4b4b4] sm:text-4xl">
              {title}
            </h1>
            <div className="pt-3 text-base text-gray-400 sm:pt-4">
              {dayjs(data?.chat?.createdAt).format("MMMM D, YYYY")}
            </div>
            <div className="mt-4">
              <div className="mb-4 flex items-start justify-start gap-2.5 rounded-md bg-[#2f2f2f] p-4 text-[#b4b4b4] last:mb-0">
                <InformationCircleIcon className="w-5 h-5" />
                This conversation may reflect the link creator’s personalized
                data, which isn’t shared and can meaningfully change how the
                model responds.
              </div>
            </div>
          </div>
        </div>
        <ChatWindow conversation={conversation} input="" />
      </div>

      <div className="dark:border-white/20 md:border-transparent md:dark:border-transparent">
        <div className="relative w-full flex flex-col flex-1 items-center justify-center gap-2 pt-3 empty:hidden sm:flex-row">
          <Link
            href="/"
            className="bg-[rgb(249,249,249)] text-[rgb(13,13,13)] text-base font-semibold px-5 py-3 min-h-11 rounded-full inline-flex justify-center items-center"
          >
            Continue this conversation
          </Link>
        </div>
        <div className="flex justify-center gap-3 p-2 text-xs text-[#9b9b9b]">
          <button>Report Content</button>
          <span>|</span>
          <Link href="/">Terms of use</Link>
          <span>|</span>
          <Link href="/">Privacy Policy</Link>
        </div>
      </div>
    </div>
  );
};

export default ShareChat;
