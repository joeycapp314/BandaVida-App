import React from "react";
import AlertProvider from "./AlertProvider";

export default function App({ children }) {
  return <AlertProvider>{children}</AlertProvider>;
}
