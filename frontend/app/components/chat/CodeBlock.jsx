import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
} from "@codesandbox/sandpack-react";

const CodeSandbox = ({ code }) => {
  return (
    <SandpackProvider
      template="react"
      theme="dark"
      files={{
        "/App.js": { code, readOnly: true },
      }}
    >
      <SandpackLayout>
        <SandpackCodeEditor
          className="w-full text-[13px]"
          style={{
            height: "auto",
            maxWidth: "85vw",
          }}
        />
      </SandpackLayout>
    </SandpackProvider>
  );
};

export default CodeSandbox;
