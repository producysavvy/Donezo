export type EmailMessage = {
  to: string;
  subject: string;
  text: string;
};

export type EmailAdapter = {
  send(message: EmailMessage): Promise<void>;
};

class ConsoleEmailAdapter implements EmailAdapter {
  async send(message: EmailMessage) {
    console.info("[email:dev]", message);
  }
}

export const emailAdapter: EmailAdapter = new ConsoleEmailAdapter();
