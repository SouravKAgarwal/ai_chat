"use client";

import ShareChat from "../../components/chat/ShareChat";
import { use } from "react";
import Heading from "../../components/Heading";
import { useGetShareChatQuery } from "@/redux/features/chat/chatApi";

const SharePage = ({ params }) => {
  const { id: shareId } = use(params);
  const { data } = useGetShareChatQuery(shareId);

  return (
    <div>
      <Heading title={data?.chat?.title} />
      <ShareChat data={data} />
    </div>
  );
};

export default SharePage;
