"use client";

import dynamic from "next/dynamic";
import { Uploader } from "./Uploader";

// The tool is client-only. Its loading state is the same hoop, so the static HTML
// shows the upload box and nothing shifts when the JS arrives.
const PatternTool = dynamic(() => import("./PatternTool"), {
  ssr: false,
  loading: () => <Uploader disabled />,
});

export function ToolLoader() {
  return <PatternTool />;
}
