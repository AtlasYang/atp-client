import Editor, { OnMount } from "@monaco-editor/react";

interface ToolCreatorProps {
  content: string;
  setContent: (content: string) => void;
}

export default function ToolCreator({ content, setContent }: ToolCreatorProps) {
  const placeholderText = `{
  "id": "00000000-0000-0000-0000-000000000000",
  "version": "1.0.0",
  "name": "Tool Name",
  "description": "Tool Description",
  "created_at": "2025-03-26",
  "provider_interface": {}
}`;

  const handleEditorMount: OnMount = (editor, monaco) => {
    editor.updateOptions({
      padding: {
        top: 12,
        bottom: 12,
      },
    });

    const model = editor.getModel();
    if (model && content.trim() === "") {
      const decorations = editor.deltaDecorations(
        [],
        [
          {
            range: new monaco.Range(1, 1, 1, 1),
            options: {
              isWholeLine: true,
              className: "editor-placeholder-line",
              glyphMarginClassName: "",
              beforeContentClassName: "editor-placeholder",
            },
          },
        ]
      );

      const onChangeDisposable = model.onDidChangeContent(() => {
        if (model.getValue().trim() !== "") {
          editor.deltaDecorations(decorations, []);
          onChangeDisposable.dispose();
        }
      });
    }
  };

  return (
    <div className="h-[300px] w-full border rounded-md overflow-hidden">
      <Editor
        defaultLanguage="json"
        theme="vs-dark"
        value={content}
        onChange={(value) => setContent(value || "")}
        onMount={handleEditorMount}
        options={{
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          formatOnPaste: true,
          formatOnType: true,
          automaticLayout: true,
        }}
      />
      <style>{`
        .monaco-editor .editor-placeholder::before {
          content: "${placeholderText
            .replace(/\n/g, "\\A")
            .replace(/"/g, '\\"')}";
          white-space: pre;
          opacity: 0.4;
          font-style: italic;
          pointer-events: none;
          position: absolute;
          top: 12px;
          left: 14px;
          font-size: 12px;
        }
      `}</style>
    </div>
  );
}
