import { Stack } from "expo-router";
import React from "react";
import AlertProvider from "./AlertProvider";

export default function RootLayout() {
  return (
    <AlertProvider>
      <Stack screenOptions={{ headerShown: true }} />
    </AlertProvider>
  );
}
