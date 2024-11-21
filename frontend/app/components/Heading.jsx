const Heading = ({ title }) => {
  return (
    <>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>{title}</title>
      <meta property="title" content={title} />
      <meta
        name="description"
        content="MyGPT helps you get answers, find inspiration and be more productive. It is free to use and easy to try. Just ask and MyGPT can help with writing, learning, brainstorming and more."
      />
      <meta
        name="keywords"
        content="ai chat,ai,chap gpt,chat gbt,chat gpt 3,chat gpt login,chat gpt website,chat gpt,chat gtp,chat openai,chat,chatai,chatbot gpt,chatg,chatgpt login,chatgpt,gpt chat,open ai,openai chat,openai chatgpt,openai,mygpt, my gpt, my gtp"
      />
      <link
        rel="icon"
        type="image/png"
        href="/favicon-96x96.png"
        sizes="96x96"
      />
      <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      <link rel="shortcut icon" href="/favicon.ico" />
      <link
        rel="apple-touch-icon"
        sizes="180x180"
        href="/apple-touch-icon.png"
      />
      <meta name="apple-mobile-web-app-title" content="MyGPT" />
      <link rel="manifest" href="/site.webmanifest" />
    </>
  );
};

export default Heading;
