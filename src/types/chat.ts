
import { Message } from "@/components/ChatInterface";

export interface Chat {
  id: string;
  title: string | null;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}
