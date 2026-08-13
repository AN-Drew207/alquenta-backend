export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  attachments?: { filename: string; content: string }[];
}

export abstract class EmailSender {
  abstract send(message: EmailMessage): Promise<void>;
}
