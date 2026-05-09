import { Router, type Request, type Response } from 'express';
import Subscription from '../models/Subscription.js';
import {
  buildDailyPayload,
  deliverDailyNotifications
} from '../cron/sendDailyNotifications.js';
import { sendNotification } from '../utils/webPush.js';

interface SubscriptionRequestBody {
  endpoint?: string;
  keys?: {
    p256dh?: string;
    auth?: string;
  };
}

interface TestNotificationBody {
  endpoint?: string;
}

const router = Router();

router.post(
  '/subscribe',
  async (
    req: Request<Record<string, never>, unknown, SubscriptionRequestBody>,
    res: Response
  ) => {
    try {
      const { endpoint, keys } = req.body;

      if (!endpoint || !keys?.p256dh || !keys?.auth) {
        return res.status(400).json({ message: 'A valid push subscription is required.' });
      }

      const subscription = await Subscription.findOneAndUpdate(
        { endpoint },
        {
          endpoint,
          keys: {
            p256dh: keys.p256dh,
            auth: keys.auth
          }
        },
        {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true
        }
      ).lean();

      return res.status(201).json({
        message: 'Subscription saved successfully.',
        subscription
      });
    } catch {
      return res.status(500).json({ message: 'Unable to save subscription.' });
    }
  }
);

router.post(
  '/notify/test',
  async (req: Request<Record<string, never>, unknown, TestNotificationBody>, res: Response) => {
    try {
      const { endpoint } = req.body;
      const payload = await buildDailyPayload();

      if (endpoint) {
        const subscription = await Subscription.findOne({ endpoint }).lean();

        if (!subscription) {
          return res.status(404).json({ message: 'Subscription not found.' });
        }

        await sendNotification(subscription, payload);
        console.log(`Manual test push sent: ${subscription.endpoint}`);

        return res.json({ message: 'Test notification sent.', sent: 1 });
      }

      await deliverDailyNotifications();

      return res.json({
        message: 'Test notification job executed.',
        sent: 'all'
      });
    } catch (error) {
      const statusCode =
        typeof error === 'object' && error !== null && 'statusCode' in error
          ? Number(error.statusCode)
          : typeof error === 'object' && error !== null && 'status' in error
            ? Number(error.status)
            : undefined;

      if ((statusCode === 404 || statusCode === 410) && req.body.endpoint) {
        await Subscription.deleteOne({ endpoint: req.body.endpoint });
      }

      return res.status(500).json({ message: 'Unable to send test notification.' });
    }
  }
);

export default router;
