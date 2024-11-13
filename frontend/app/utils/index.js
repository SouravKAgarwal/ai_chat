import Markdown from "markdown-to-jsx";
import removeMarkdown from "markdown-to-text";
import CodeSandbox from "../components/chat/CodeBlock";
import CopyToClipboard from "react-copy-to-clipboard";
import { toast } from "sonner";
import { HiOutlineSpeakerWave, HiOutlineSpeakerXMark } from "react-icons/hi2";
import { GrFormNext, GrFormPrevious } from "react-icons/gr";
import { GoGraph, GoLightBulb } from "react-icons/go";
import { TbRefresh, TbMath, TbTerminal2, TbCopy } from "react-icons/tb";
import { LuCopy, LuPencil } from "react-icons/lu";
import { BsTranslate } from "react-icons/bs";
import { RiQuillPenFill } from "react-icons/ri";
import { AiOutlineQuestionCircle } from "react-icons/ai";
import { useEffect, useState } from "react";

export const handleTextToSpeech = (
  text,
  index,
  conversation,
  setConversation
) => {
  const utterance = new SpeechSynthesisUtterance(removeMarkdown(text));
  const newConversation = conversation.map((msg, idx) => {
    if (idx === index) {
      return { ...msg, mute: !msg.mute };
    }
    return msg;
  });
  setConversation(newConversation);

  if (!conversation[index].mute) {
    utterance.onend = () => {
      setConversation((prevConversation) =>
        prevConversation.map((msg, idx) =>
          idx === index ? { ...msg, mute: msg.mute } : msg
        )
      );
    };
    speechSynthesis.speak(utterance);
  } else {
    speechSynthesis.cancel();
  }
};

const TypewriterText = ({ text, className }) => {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    let currentIndex = 0;
    const intervalId = setInterval(() => {
      setDisplayedText(text.substring(0, currentIndex + 1));
      currentIndex += 1;

      if (currentIndex >= text.length) {
        clearInterval(intervalId);
      }
    }, 20);

    return () => clearInterval(intervalId);
  }, [text]);

  return (
    <span className={className}>
      <Markdown>{displayedText}</Markdown>
    </span>
  );
};

export const formatResponse = (
  text,
  index,
  conversation,
  setConversation,
  handleRefresh,
  current,
  handlePrev,
  handleNext
) => {
  const explanationRegex = /()Explanation:(.*)/s;
  const explanationMatch = text.match(explanationRegex);
  const explanation = explanationMatch ? explanationMatch[2].trim() : null;

  const mainPart = explanation
    ? text.replace(explanationMatch[0], "").trim()
    : text;

  const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;

  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(mainPart)) !== null) {
    if (match.index > lastIndex) {
      parts.push(
        !conversation[index].aiShown && index === conversation.length - 1 ? (
          <TypewriterText
            key={lastIndex}
            text={mainPart.slice(lastIndex, match.index)}
            className="leading-6"
          />
        ) : (
          <span className="leading-6" key={lastIndex}>
            <Markdown>{mainPart.slice(lastIndex, match.index)}</Markdown>
          </span>
        )
      );
    }

    const language = match[1];
    const codeContent = match[2];

    parts.push(
      <div
        key={match.index}
        className="relative text-sm bg-black text-white rounded-md mb-4"
      >
        {language && (
          <div className="flex justify-between items-center bg-[#393838] text-[#ccc] p-3 px-4 rounded-t-md">
            <span className="text-xs">{language}</span>
            <CopyToClipboard text={codeContent}>
              <button
                className="flex gap-2 items-center text-[#ccc] text-xs"
                onClick={() => toast.success("Copied to clipboard!")}
              >
                <LuCopy />
                Copy code
              </button>
            </CopyToClipboard>
          </div>
        )}
        <CodeSandbox code={codeContent} />
      </div>
    );

    lastIndex = codeBlockRegex.lastIndex;
  }

  if (lastIndex < mainPart.length) {
    parts.push(
      !conversation[index]?.aiShown && index === conversation.length - 1 ? (
        <TypewriterText
          key={lastIndex}
          text={mainPart.slice(lastIndex)}
          className="leading-6 text-[15px]"
        />
      ) : (
        <span className="leading-6 text-[15px]" key={lastIndex}>
          <Markdown>{mainPart.slice(lastIndex)}</Markdown>
        </span>
      )
    );
  }

  return (
    <>
      {parts}
      {explanation &&
        (!conversation[index]?.aiShown && index === conversation.length - 1 ? (
          <TypewriterText
            text={explanation}
            className="my-4 text-[15px] leading-6 rounded-lg"
          />
        ) : (
          <div className="my-4 text-[15px] leading-6 rounded-lg">
            <Markdown>{explanation}</Markdown>
          </div>
        ))}
      <div className="flex text-xl text-[#aaa] space-x-3 mt-2">
        {conversation[index]?.refreshedResponses?.length > 0 && (
          <div className="flex items-center">
            <button className="flex items-center" onClick={() => handlePrev()}>
              <GrFormPrevious />
            </button>
            <span className="text-[15px]">
              {current}/{conversation[index]?.refreshedResponses?.length + 1}
            </span>

            <button className="flex items-center" onClick={() => handleNext()}>
              <GrFormNext />
            </button>
          </div>
        )}
        <button
          onClick={() =>
            handleTextToSpeech(text, index, conversation, setConversation)
          }
        >
          {conversation[index]?.mute ? (
            <HiOutlineSpeakerXMark strokeWidth={2} />
          ) : (
            <HiOutlineSpeakerWave strokeWidth={2} />
          )}
        </button>
        <CopyToClipboard text={text}>
          <button onClick={() => toast.success("Copied to clipboard!")}>
            <TbCopy />
          </button>
        </CopyToClipboard>
        <button onClick={() => handleRefresh(index)}>
          <TbRefresh />
        </button>
      </div>
      {index === conversation.length - 1 && <div className="py-6" />}
    </>
  );
};

export const tabs = [
  {
    label: "Code",
    icon: <TbTerminal2 className="text-lg text-blue-500" />,
    prompts: [
      "Write a function to reverse a string in JavaScript.",
      "Create a function to calculate the factorial of a number.",
      "Implement a simple to-do list application using React.",
      "Write a JavaScript code snippet to fetch data from an API.",
      "Create a simple calculator using HTML, CSS, and JavaScript.",
    ],
  },
  {
    label: "Help me write",
    icon: <LuPencil className="text-lg text-pink-300" />,
    prompts: [
      "Help me write an email to my professor requesting an extension.",
      "Draft a cover letter for a job application.",
      "Compose a message to my friend about our weekend plans.",
      "Write a short story about a time traveler.",
      "Create a social media post promoting my new blog.",
    ],
  },
  {
    label: "Analyze data",
    icon: <GoGraph className="text-lg text-blue-300" />,
    prompts: [
      "Analyze this dataset and provide insights on trends.",
      "What statistical methods can I use to analyze sales data?",
      "Help me visualize this data using graphs.",
      "Summarize the key findings from this research paper.",
      "What machine learning algorithms can I use for data prediction?",
    ],
  },
  {
    label: "Mathematics",
    icon: <TbMath className="text-lg text-green-500" />,
    prompts: [
      "Solve this math problem: What is the derivative of x^2?",
      "What is the integral of sin(x) dx?",
      "Calculate the area of a circle with radius 5.",
      "What is the Pythagorean theorem?",
      "Solve the equation: 2x + 3 = 11.",
    ],
  },
  {
    label: "Brainstorm",
    icon: <GoLightBulb className="text-lg text-yellow-500" />,
    prompts: [
      "What are some creative ideas for a birthday party?",
      "Suggest fun activities for a family reunion.",
      "What innovative ways can I promote a small business?",
      "Brainstorm ideas for a community service project.",
      "Generate unique themes for a wedding.",
    ],
  },
  {
    label: "Translate",
    icon: <BsTranslate className="text-lg text-purple-500" />,
    prompts: [
      "Translate this text into Spanish.",
      "What is the French translation for 'Hello world'?",
      "Translate this website into Japanese.",
      "Can you translate this poem into Italian?",
      "How do you say 'Thank you' in Mandarin?",
    ],
  },
  {
    label: "Creative Writing",
    icon: <RiQuillPenFill className="text-lg text-orange-500" />,
    prompts: [
      "Write a poem about the ocean.",
      "Create a short story with a twist ending.",
      "Help me write a song about love.",
      "Write a script for a short film.",
      "Generate ideas for a fantasy novel.",
    ],
  },
  {
    label: "Explain Concepts",
    icon: <AiOutlineQuestionCircle className="text-lg text-gray-500" />,
    prompts: [
      "Explain quantum mechanics in simple terms.",
      "What is the concept of time dilation?",
      "Explain the difference between communism and socialism.",
      "Describe the process of photosynthesis.",
      "How does artificial intelligence work?",
    ],
  },
];

export function categorizeChatsByDate(chats) {
  const today = new Date();
  const oneDay = 1000 * 60 * 60 * 24;
  const todayStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  const yesterdayStart = new Date(todayStart.getTime() - oneDay);
  const sevenDaysAgo = new Date(todayStart.getTime() - oneDay * 7);
  const thirtyDaysAgo = new Date(todayStart.getTime() - oneDay * 30);

  const categories = {
    today: [],
    yesterday: [],
    last7days: [],
    last30days: [],
    older: [],
  };

  chats.forEach((chat) => {
    const updatedAt = new Date(chat.updatedAt);

    if (updatedAt >= todayStart) {
      categories.today.push(chat);
    } else if (updatedAt >= yesterdayStart && updatedAt < todayStart) {
      categories.yesterday.push(chat);
    } else if (updatedAt >= sevenDaysAgo && updatedAt < yesterdayStart) {
      categories.last7days.push(chat);
    } else if (updatedAt >= thirtyDaysAgo && updatedAt < sevenDaysAgo) {
      categories.last30days.push(chat);
    } else {
      categories.older.push(chat);
    }
  });

  Object.keys(categories).forEach((category) => {
    categories[category].sort(
      (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
    );
  });

  return categories;
}
