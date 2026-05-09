import dotenv from 'dotenv';
import webpush from 'web-push';
import type { NotificationPayload, SubscriptionDocumentShape } from '../types/models.js';

dotenv.config();

const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails('mailto:support@dailycheer.app', vapidPublicKey, vapidPrivateKey);
}

export async function sendNotification(
  subscription: SubscriptionDocumentShape,
  payload: NotificationPayload
): Promise<webpush.SendResult> {
  return webpush.sendNotification(subscription, JSON.stringify(payload));
}
