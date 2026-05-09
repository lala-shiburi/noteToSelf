import dotenv from 'dotenv';
import { connectDB } from '../config/db.js';
import Quote from '../models/Quote.js';

dotenv.config();

const quotes = [
  {
    text: 'Success is the sum of small efforts repeated day in and day out.',
    author: 'Robert Collier',
    category: 'motivation'
  },
  {
    text: 'It always seems impossible until it is done.',
    author: 'Nelson Mandela',
    category: 'perseverance'
  },
  {
    text: 'The future depends on what you do today.',
    author: 'Mahatma Gandhi',
    category: 'action'
  },
  {
    text: 'Small deeds done are better than great deeds planned.',
    author: 'Peter Marshall',
    category: 'discipline'
  },
  {
    text: 'You do not have to see the whole staircase, just take the first step.',
    author: 'Martin Luther King Jr.',
    category: 'courage'
  }
] as const;

async function seedQuotes(): Promise<void> {
  try {
    await connectDB();

    const operations = quotes.map((quote) => ({
      updateOne: {
        filter: { text: quote.text },
        update: { $setOnInsert: quote },
        upsert: true
      }
    }));

    const result = await Quote.bulkWrite(operations, { ordered: false });
    console.log('Quote seed complete:', result);
    process.exit(0);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown seed error';
    console.error('Quote seed failed:', message);
    process.exit(1);
  }
}

void seedQuotes();
