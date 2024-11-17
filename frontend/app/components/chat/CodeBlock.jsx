import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
} from "@codesandbox/sandpack-react";

const CodeSandbox = ({ code, theme = "dark" }) => {
  return (
    <SandpackProvider
      template="react"
      theme={theme}
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
