export interface QuoteDocumentShape {
  text: string;
  author?: string;
  category?: string;
  createdAt: Date;
}

export interface SubscriptionKeys {
  p256dh: string;
  auth: string;
}

export interface SubscriptionDocumentShape {
  endpoint: string;
  keys: SubscriptionKeys;
  createdAt: Date;
}

export interface NotificationPayload {
  title: string;
  body: string;
}
