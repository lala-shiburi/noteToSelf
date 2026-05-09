import { Schema, model } from 'mongoose';
import type { HydratedDocument } from 'mongoose';
import type { SubscriptionDocumentShape } from '../types/models.js';

export type SubscriptionDocument = HydratedDocument<SubscriptionDocumentShape>;

const subscriptionSchema = new Schema<SubscriptionDocumentShape>(
  {
    endpoint: {
      type: String,
      required: true,
      unique: true
    },
    keys: {
      p256dh: {
        type: String,
        required: true
      },
      auth: {
        type: String,
        required: true
      }
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    versionKey: false
  }
);

const Subscription = model<SubscriptionDocumentShape>('Subscription', subscriptionSchema);

export default Subscription;
