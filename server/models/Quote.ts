import { Schema, model } from 'mongoose';
import type { HydratedDocument } from 'mongoose';
import type { QuoteDocumentShape } from '../types/models.js';

export type QuoteDocument = HydratedDocument<QuoteDocumentShape>;

const quoteSchema = new Schema<QuoteDocumentShape>(
  {
    text: {
      type: String,
      required: true,
      trim: true
    },
    author: {
      type: String,
      trim: true,
      default: ''
    },
    category: {
      type: String,
      trim: true,
      default: ''
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

quoteSchema.index({ text: 1 }, { unique: true });

const Quote = model<QuoteDocumentShape>('Quote', quoteSchema);

export default Quote;
