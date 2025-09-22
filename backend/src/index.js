import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import authRouter from './routes/auth.js';
import feedbackRouter from './routes/feedback.js';
import questionsRouter from './routes/questions.js';
import formsRouter from './routes/forms.js';
import adminRouter from './routes/admin.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRouter);
app.use('/api/feedback', feedbackRouter);
app.use('/api/questions', questionsRouter);
app.use('/api/forms', formsRouter);
app.use('/api/admin', adminRouter);

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});

