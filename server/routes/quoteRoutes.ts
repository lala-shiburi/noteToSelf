import { Router, type Request, type Response } from 'express';
import Quote from '../models/Quote.js';

interface CreateQuoteBody {
  text?: string;
  author?: string;
  category?: string;
}

const router = Router();

router.post(
  '/quote',
  async (req: Request<Record<string, never>, unknown, CreateQuoteBody>, res: Response) => {
    try {
      const { text, author, category } = req.body;

      if (!text?.trim()) {
        return res.status(400).json({ message: 'Quote text is required.' });
      }

      const quote = await Quote.create({
        text: text.trim(),
        author: author?.trim() || '',
        category: category?.trim() || ''
      });

      return res.status(201).json(quote);
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'code' in error && error.code === 11000) {
        return res.status(409).json({ message: 'This quote already exists.' });
      }

      return res.status(500).json({ message: 'Unable to create quote.' });
    }
  }
);

router.get('/quote/random', async (_req: Request, res: Response) => {
  try {
    const [quote] = await Quote.aggregate<Array<{ text: string; author?: string; category?: string }>>([
      { $sample: { size: 1 } }
    ]);

    if (!quote) {
      return res.status(404).json({ message: 'No quotes found.' });
    }

    return res.json(quote);
  } catch {
    return res.status(500).json({ message: 'Unable to fetch quote.' });
  }
});

export default router;
