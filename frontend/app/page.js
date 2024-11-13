"use client";

import Heading from "./components/Heading";
import { useSelector } from "react-redux";
import NewChat from "./components/chat/NewChat";

const ChatPage = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="flex h-[100dvh] md:h-screen overflow-hidden">
      <Heading title="MyGPT" />
      <NewChat user={user} />
    </div>
  );
};

export default ChatPage;
