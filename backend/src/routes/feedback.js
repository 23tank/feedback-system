import { Router } from 'express';
import { query } from '../config/db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  const rows = await query(
    'SELECT f.*, u.username FROM feedback f JOIN users u ON f.user_id = u.id ORDER BY f.created_at DESC'
  );
  res.json(rows);
});

router.post('/', requireAuth, async (req, res) => {
  const { feedback_text } = req.body;
  if (!feedback_text) return res.status(400).json({ message: 'feedback_text required' });
  const result = await query('INSERT INTO feedback (user_id, feedback_text, votes) VALUES (?, ?, 0)', [req.user.id, feedback_text]);
  const created = await query('SELECT * FROM feedback WHERE id = ?', [result.insertId]);
  res.status(201).json(created[0]);
});

router.put('/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { feedback_text } = req.body;
  await query('UPDATE feedback SET feedback_text = ? WHERE id = ? AND user_id = ?', [feedback_text, id, req.user.id]);
  const updated = await query('SELECT * FROM feedback WHERE id = ?', [id]);
  res.json(updated[0]);
});

router.delete('/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  await query('DELETE FROM feedback WHERE id = ? AND user_id = ?', [id, req.user.id]);
  res.json({ success: true });
});

router.post('/:id/vote', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { direction } = req.body; // 'up' | 'down'
  const delta = direction === 'down' ? -1 : 1;
  await query('UPDATE feedback SET votes = votes + ? WHERE id = ?', [delta, id]);
  const updated = await query('SELECT * FROM feedback WHERE id = ?', [id]);
  res.json(updated[0]);
});

export default router;

