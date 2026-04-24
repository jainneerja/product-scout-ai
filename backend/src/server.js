import express from 'express';
import cors from 'cors';
import analyzeRoutes from './routes/analyze.js';

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api', analyzeRoutes);

app.listen(port, () => {
  console.log(`AI Product Scout backend listening on ${port}`);
});
