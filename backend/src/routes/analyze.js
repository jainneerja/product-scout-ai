import express from 'express';
import { analyzeCategory } from '../services/analyzer.js';

const router = express.Router();

router.post('/analyze', (req, res) => {
  const { category } = req.body ?? {};

  const result = analyzeCategory(category);
  res.json(result);
});

export default router;
