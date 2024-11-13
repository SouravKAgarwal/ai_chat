"use client";

import { use } from "react";
import Protected from "../../hooks/useProtected";
import ChatDetails from "../../components/chat/ChatDetails";

const ChatPage = ({ params }) => {
  const { id: chatId } = use(params);

  return (
    <div>
      <Protected>
        <ChatDetails chatId={chatId} />
      </Protected>
    </div>
  );
};

export default ChatPage;
