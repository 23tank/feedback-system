import { Router } from 'express';
import { query } from '../config/db.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

// List forms (public to authenticated users)
router.get('/', requireAuth, async (req, res) => {
  try {
    const rows = await query('SELECT * FROM forms WHERE published = 1 ORDER BY created_at DESC');
    return res.json(rows);
  } catch (err) {
    // Fallback if `published` column not yet migrated
    const rows = await query('SELECT * FROM forms ORDER BY created_at DESC');
    return res.json(rows);
  }
});

// Get form with questions
router.get('/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const [form] = await query('SELECT * FROM forms WHERE id = ?', [id]);
  if (!form) return res.status(404).json({ message: 'Form not found' });
  const qs = await query('SELECT * FROM questions WHERE form_id = ? ORDER BY id ASC', [id]);
  res.json({ ...form, questions: qs });
});

// Admin: create a new form with questions
router.post('/', requireAuth, requireAdmin, async (req, res) => {
  const { title, description, image_url, published, questions } = req.body;
  if (!title) return res.status(400).json({ message: 'title required' });
  const result = await query('INSERT INTO forms (title, description, image_url, published, created_by) VALUES (?, ?, ?, ?, ?)', [title, description || null, image_url || null, published ? 1 : 0, req.user.id]);
  const formId = result.insertId;
  if (Array.isArray(questions)) {
    for (const q of questions) {
      const qType = ['single','yesno','likert','text','stars'].includes(q.type) ? q.type : 'single';
      await query('INSERT INTO questions (form_id, question_text, type, options, answer, image_url) VALUES (?, ?, ?, ?, ?, ?)', [formId, q.question_text, qType, JSON.stringify(q.options || []), q.answer || null, q.image_url || null]);
    }
  }
  const [created] = await query('SELECT * FROM forms WHERE id = ?', [formId]);
  res.status(201).json(created);
});

// Admin: publish/unpublish
router.put('/:id/publish', requireAuth, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { published } = req.body;
  await query('UPDATE forms SET published = ? WHERE id = ?', [published ? 1 : 0, id]);
  res.json({ success: true });
});

export default router;

