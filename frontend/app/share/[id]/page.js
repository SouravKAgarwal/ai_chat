"use client";

import { useGetChatsByIdQuery } from "@/redux/features/chat/chatApi";
import ShareChat from "../../components/chat/ShareChat";
import { use } from "react";
import Heading from "../../components/Heading";

const SharePage = ({ params }) => {
  const { id: chatId } = use(params);
  const { data } = useGetChatsByIdQuery(chatId);

  return (
    <div>
      <Heading title={data?.chat?.title} />
      <ShareChat data={data} />
    </div>
  );
};

export default SharePage;
