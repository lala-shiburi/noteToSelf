import cron from 'node-cron';
import Quote from '../models/Quote.js';
import Subscription from '../models/Subscription.js';
import { sendNotification } from '../utils/webPush.js';
import type { NotificationPayload, SubscriptionDocumentShape } from '../types/models.js';

export async function buildDailyPayload(): Promise<NotificationPayload> {
  const quoteCount = await Quote.countDocuments();

  if (quoteCount === 0) {
    return {
      title: 'Good morning ☀️',
      body: 'Add a few quotes to Daily Cheer so tomorrow starts with inspiration.'
    };
  }

  const [quote] = await Quote.aggregate<Array<{ text: string; author?: string }>>([
    { $sample: { size: 1 } }
  ]);

  const body = quote.author ? `"${quote.text}" — ${quote.author}` : quote.text;

  return {
    title: 'Good morning ☀️',
    body
  };
}

async function removeInvalidSubscription(endpoint: string): Promise<void> {
  await Subscription.deleteOne({ endpoint });
  console.log(`Removed invalid subscription: ${endpoint}`);
}

export async function deliverDailyNotifications(): Promise<void> {
  try {
    const subscriptions = await Subscription.find().lean<SubscriptionDocumentShape[]>();

    if (subscriptions.length === 0) {
      console.log('Daily push skipped: no subscriptions found');
      return;
    }

    const payload = await buildDailyPayload();

    for (const subscription of subscriptions) {
      try {
        await sendNotification(subscription, payload);
        console.log(`Push sent successfully: ${subscription.endpoint}`);
      } catch (error) {
        const statusCode =
          typeof error === 'object' && error !== null && 'statusCode' in error
            ? Number(error.statusCode)
            : typeof error === 'object' && error !== null && 'status' in error
              ? Number(error.status)
              : undefined;

        const message =
          typeof error === 'object' && error !== null && 'body' in error
            ? String(error.body)
            : error instanceof Error
              ? error.message
              : 'Unknown push error';

        console.error(`Push failed for ${subscription.endpoint}:`, message);

        if (statusCode === 404 || statusCode === 410) {
          await removeInvalidSubscription(subscription.endpoint);
        }
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown cron job error';
    console.error('Daily notification job failed:', message);
  }
}

export function scheduleDailyNotifications(): void {
  cron.schedule('0 7 * * *', () => {
    console.log('Running scheduled notification job at 07:00');
    void deliverDailyNotifications();
  });
}
