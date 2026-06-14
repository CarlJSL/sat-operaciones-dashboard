import { api } from "@/core/lib/api";

type SendMessagePayload = {
  telefono: string;
  mensaje: string;
};

export const wspService = {
  sendMessage: async (payload: SendMessagePayload): Promise<void> => {
    await api.post("/api/wsp/sendMessageTwilio", payload);
  },
};
