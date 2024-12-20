import { FaRainbow } from "react-icons/fa";
import { useEffect, useRef, useState } from "react";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import { GoArrowDown } from "react-icons/go";
import { tabs } from "../../utils";
import Image from "next/image";

const ChatWindow = ({
  className,
  setFile,
  conversation,
  loading,
  setPreviewImage,
  previewImage,
  image,
  setImage,
  setConversation,
  input,
  setInput,
  handleSendMessage,
  handleKeyDown,
  handleRefresh,
}) => {
  const chatWindowRef = useRef(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [showMoreTabs, setShowMoreTabs] = useState(false);

  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [conversation]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        chatWindowRef.current.scrollTop <
        chatWindowRef.current.scrollHeight -
          chatWindowRef.current.clientHeight -
          100
      ) {
        setShowScrollButton(true);
      } else {
        setShowScrollButton(false);
      }
    };

    if (chatWindowRef.current) {
      chatWindowRef.current.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (chatWindowRef.current) {
        chatWindowRef.current.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  const handleTabClick = (prompt) => {
    setInput(prompt);
  };

  const scrollToBottom = () => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  };

  const initialTabs = tabs.slice(0, 4);
  const remainingTabs = tabs.slice(4);

  return (
    <div
      ref={chatWindowRef}
      className={`w-full max-w-3xl mx-auto px-3 md:pl-14 pt-6 flex-1 ${className} flex flex-col hide-scrollbar`}
      style={{ height: "100%" }}
    >
      {conversation.length > 0 ? (
        conversation.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.sender === "human"
                ? "self-end"
                : "items-start ml-0 md:-ml-14 px-0 md:px-6 py-3"
            }`}
          >
            {msg.sender === "ai" && (
              <div className="mr-2 hidden md:block mt-4">
                <Image
                  src="/logo_image.png"
                  height={1000}
                  width={1000}
                  className="h-6 w-6 object-cover object-center border border-[hsla(0,0%,100%,.5)] rounded-full max-w-fit"
                  alt="logo"
                />
              </div>
            )}
            <div className="w-full">
              <ChatMessage
                msg={msg}
                index={index}
                loading={loading}
                conversation={conversation}
                setConversation={setConversation}
                image={previewImage}
                handleRefresh={handleRefresh}
              />
            </div>
          </div>
        ))
      ) : (
        <div
          className="w-full flex flex-col items-center justify-center h-[80%]"
          style={{ display: location.pathname !== "/" && "none" }}
        >
          <div className="text-3xl font-bold">Start the conversation!</div>
          <div className="flex justify-center w-full py-4">
            <ChatInput
              setFile={setFile}
              input={input}
              setInput={setInput}
              image={image}
              previewImage={previewImage}
              setPreviewImage={setPreviewImage}
              setImage={setImage}
              handleSendMessage={handleSendMessage}
              loading={loading}
              handleKeyDown={handleKeyDown}
            />
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 px-0 md:px-4 py-2">
            {initialTabs.map((tab, idx) => (
              <button
                key={idx}
                className="flex items-center space-x-2 px-3 py-2 rounded-full border border-[hsla(0,0%,100%,.15)]"
                onClick={() => {
                  const randomPrompt =
                    tab.prompts[Math.floor(Math.random() * tab.prompts.length)];
                  handleTabClick(randomPrompt);
                }}
              >
                {tab.icon}
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            ))}
            {!showMoreTabs && (
              <button
                className="flex items-center space-x-2 px-3 py-2 rounded-full border border-[hsla(0,0%,100%,.15)]"
                onClick={() => setShowMoreTabs(true)}
              >
                <span className="text-sm font-medium">More</span>
              </button>
            )}
            {showMoreTabs &&
              remainingTabs.map((tab, idx) => (
                <button
                  key={idx}
                  className="flex items-center space-x-2 px-3 py-2 rounded-full border border-[hsla(0,0%,100%,.15)]"
                  onClick={() => {
                    const randomPrompt =
                      tab.prompts[
                        Math.floor(Math.random() * tab.prompts.length)
                      ];
                    handleTabClick(randomPrompt);
                  }}
                >
                  {tab.icon}
                  <span className="text-sm font-medium">{tab.label}</span>
                </button>
              ))}
          </div>
        </div>
      )}
      {showScrollButton && (
        <div className="sticky bottom-4 flex justify-center">
          <button
            className="bg-[#666] text-white p-2 rounded-full"
            onClick={scrollToBottom}
          >
            <GoArrowDown size={16} />
          </button>
        </div>
      )}
    </div>
  );
};
export default ChatWindow;
