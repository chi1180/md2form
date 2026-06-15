import ReactCodeMirror from "@uiw/react-codemirror";
import { useState } from "react";
import { basicSetup } from "@uiw/react-codemirror";
import { markdown } from "@codemirror/lang-markdown";
import { myTheme } from "#/utils/codemirror.config";

export default function Editor() {
  const [value, setValue] = useState("");
  return (
    <ReactCodeMirror
      value={value}
      onChange={(val) => setValue(val)}
      theme={myTheme}
      extensions={[basicSetup(), markdown()]}
    ></ReactCodeMirror>
  );
}
