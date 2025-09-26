declare module 'notifications-node-client' {
  export class NotifyClient {
    constructor(apiKey: string);

    sendEmail(
      templateId: string,
      emailAddress: string,
      options?: {
        personalisation?: Record<string, string | string[]>;
        reference?: string | null;
        emailReplyToId?: string;
        oneClickUnsubscribeURL?: string;
      }
    ): Promise<any>;
  }
}
