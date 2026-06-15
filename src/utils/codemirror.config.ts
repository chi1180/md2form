import { EditorView } from "@codemirror/view";

export const myTheme = EditorView.theme({
  "&": {
    color: "#1a1a1a",
    backgroundColor: "#eaeaea",
    borderRadius: "8px",
    border: "none",
    width: "100%",
    height: "100%",
  },
  "&.cm-focused": {
    outline: "none",
  },
  "&.cm-focused .cm-selectionBackground, ::selection": {
    backgroundColor: "#d9d9d9",
  },
  ".cm-gutters": {
    backgroundColor: "#d9d9d9",
    color: "#1a1a1a",
    border: "none",
    borderRadius: "8px",
  },
  ".cm-activeLineGutter": {
    backgroundColor: "#eaeaea",
  },
  ".cm-activeLine": {
    backgroundColor: "#eaeaea",
  },
});
