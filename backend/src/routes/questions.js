import { Router } from 'express';
import { query } from '../config/db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  const rows = await query('SELECT * FROM questions ORDER BY id ASC');
  res.json(rows);
});

router.post('/', requireAuth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
  const { question_text, options, answer } = req.body;
  const result = await query('INSERT INTO questions (question_text, options, answer) VALUES (?, ?, ?)', [question_text, JSON.stringify(options || []), answer || null]);
  const created = await query('SELECT * FROM questions WHERE id = ?', [result.insertId]);
  res.status(201).json(created[0]);
});

router.put('/:id', requireAuth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
  const { id } = req.params;
  const { question_text, options, answer } = req.body;
  await query('UPDATE questions SET question_text = ?, options = ?, answer = ? WHERE id = ?', [question_text, JSON.stringify(options || []), answer || null, id]);
  const updated = await query('SELECT * FROM questions WHERE id = ?', [id]);
  res.json(updated[0]);
});

router.delete('/:id', requireAuth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
  const { id } = req.params;
  await query('DELETE FROM questions WHERE id = ?', [id]);
  res.json({ success: true });
});

router.post('/:id/answer', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { answer } = req.body;
  await query('INSERT INTO responses (user_id, question_id, answer) VALUES (?, ?, ?)', [req.user.id, id, answer]);
  res.json({ success: true });
});

export default router;

