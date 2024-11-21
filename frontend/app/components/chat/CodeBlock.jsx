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
          style={{
            height: "auto",
            maxWidth: "85vw",
            fontSize: "14px",
          }}
        />
      </SandpackLayout>
    </SandpackProvider>
  );
};

export default CodeSandbox;
