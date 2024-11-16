import { FaRainbow } from "react-icons/fa";
import { useEffect, useRef, useState } from "react";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import { GoArrowDown } from "react-icons/go";
import { tabs } from "../../utils";

const ChatWindow = ({
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

  const initialTabs = tabs.slice(0, 5);
  const remainingTabs = tabs.slice(5);

  return (
    <div
      ref={chatWindowRef}
      className="w-full max-w-4xl mx-auto px-4 md:px-14 pt-6 flex-1 overflow-y-auto flex flex-col hide-scrollbar"
      style={{ height: "100%" }}
    >
      {conversation.length > 0 ? (
        conversation.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.sender === "human" ? "self-end" : "items-start py-3"
            }`}
          >
            {msg.sender === "ai" && (
              <div className="mr-3 rounded-full hidden md:block p-2 mt-1 bg-transparent border border-[#ddd] dark:border-[#bbb]">
                <FaRainbow
                  size={14}
                  className="text-3xl text-[#666] dark:text-[#ccc]"
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
          className="w-full flex flex-col items-center justify-center h-full"
          style={{ display: location.pathname !== "/" && "none" }}
        >
          <div className="text-2xl font-bold py-5">Start the conversation!</div>
          <div className="flex justify-center w-full max-w-4xl mb-2">
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
                className="flex items-center space-x-2 px-3 py-2 rounded-full border border-gray-600"
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
                className="flex items-center space-x-2 px-3 py-2 rounded-full border border-gray-600"
                onClick={() => setShowMoreTabs(true)}
              >
                <span className="text-sm font-medium">More</span>
              </button>
            )}
            {showMoreTabs &&
              remainingTabs.map((tab, idx) => (
                <button
                  key={idx}
                  className="flex items-center space-x-2 px-3 py-2 rounded-full border border-gray-600"
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
