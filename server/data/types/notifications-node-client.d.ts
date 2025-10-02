declare module 'notifications-node-client' {
  interface EmailResponse {
    id: string
    reference?: string
    content: {
      subject: string
      body: string
      from_email: string
      one_click_unsubscribe_url?: string
    }
    uri: string
    template: {
      id: string
      version: number
      uri: string
    }
  }

  class NotifyClient {
    constructor(apiKey: string)

    sendEmail(
      templateId: string,
      emailAddress: string,
      options?: {
        personalisation?: Record<string, string | string[]>
        reference?: string | null
        emailReplyToId?: string
        oneClickUnsubscribeURL?: string
      },
    ): Promise<EmailResponse>
  }
}
