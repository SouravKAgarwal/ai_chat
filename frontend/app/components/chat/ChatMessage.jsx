import { useState, useEffect } from "react";
import { formatResponse } from "../../utils";
import { HiOutlineXMark } from "react-icons/hi2";
import Image from "next/image";

const ChatMessage = ({
  msg,
  index,
  loading,
  conversation,
  setConversation,
  image,
  handleRefresh,
}) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [current, setCurrent] = useState(1);
  const [messages, setMessages] = useState("");

  useEffect(() => {
    const refreshedMessages = conversation[index]?.refreshedResponses || [];
    setMessages(
      current === 1 ? msg.message : refreshedMessages[current - 2]?.message
    );
  }, [current, msg.message, conversation, index]);

  const onImageClick = () => {
    setIsPreviewOpen(true);
  };

  const closePreview = () => {
    setIsPreviewOpen(false);
  };

  const handlePrev = () => {
    if (current > 1) {
      setCurrent((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (current < (conversation[index]?.refreshedResponses?.length || 0) + 1) {
      setCurrent((prev) => prev + 1);
    }
  };

  return (
    <>
      <div
        className={`${
          msg.sender === "human"
            ? "items-end max-w-xl text-white bg-zinc-700 dark:bg-[#2f2f2f] text-sm rounded-t-2xl rounded-bl-2xl p-3"
            : "self-start text-sm rounded-t-2xl rounded-br-2xl p-2"
        }`}
      >
        {msg.sender === "ai" ? (
          loading && msg.message === "" ? (
            <div className="loading-dots">
              <div className="dot"></div>
              <div className="dot"></div>
              <div className="dot"></div>
            </div>
          ) : (
            formatResponse(
              messages,
              index,
              conversation,
              setConversation,
              handleRefresh,
              current,
              handlePrev,
              handleNext
            )
          )
        ) : (
          <>
            {(image || msg?.image?.imageUrl) && (
              <div className="relative flex justify-start mb-4">
                <Image
                  src={msg?.image?.imageUrl || image}
                  className="h-40 w-full max-w-80 object-cover object-center rounded-xl cursor-pointer"
                  alt="preview-img"
                  onClick={onImageClick}
                  width={1000}
                  height={1000}
                />
              </div>
            )}
            <span className="text-sm whitespace-pre-wrap break-words">
              {msg.message}
            </span>
          </>
        )}
      </div>

      {isPreviewOpen && (
        <div
          className="fixed inset-0 m-auto max-h-[100dvh] z-50 flex items-center justify-center bg-black bg-opacity-75"
          onClick={closePreview}
        >
          <div className="relative md:max-w-2xl w-auto h-auto p-4">
            <img
              src={msg.image?.imageUrl || image}
              className="w-full h-full object-contain rounded-lg"
              alt="preview"
            />
            <button
              className="absolute top-2 right-2 bg-[#666] rounded-full p-1"
              onClick={closePreview}
            >
              <HiOutlineXMark className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatMessage;
