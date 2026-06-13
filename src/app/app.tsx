import { useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./providers/QueryProvider";
import { AppRouter } from "./router";
import { AlertContainer } from "@/shared/components/modal/alertContainer";
import { ConfirmContainer } from "@/shared/components/modal/confirmContainer";
import { SonnerDescription } from "@/shared/components/sonner-check";
import { Toaster } from "@/components/ui/sonner";
import { enableMockAuth } from "@/features/auth/mock-auth";

export default function App() {
  useEffect(() => {
    enableMockAuth();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AppRouter />
      <AlertContainer></AlertContainer>
      <ConfirmContainer></ConfirmContainer>
      <Toaster position="top-center"  />
      <SonnerDescription />
    </QueryClientProvider>
  );
}
