import { Router } from 'express';
import { query } from '../config/db.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/analytics', requireAuth, requireAdmin, async (req, res) => {
  const [usersCount] = await query('SELECT COUNT(*) as count FROM users');
  const [feedbackCount] = await query('SELECT COUNT(*) as count FROM feedback');
  const trends = await query('SELECT DATE(created_at) as date, COUNT(*) as count FROM feedback GROUP BY DATE(created_at) ORDER BY date ASC');
  const votesAgg = await query('SELECT SUM(CASE WHEN votes > 0 THEN 1 ELSE 0 END) as positive, SUM(CASE WHEN votes < 0 THEN 1 ELSE 0 END) as negative FROM feedback');
  res.json({
    users: usersCount.count,
    feedback: feedbackCount.count,
    trends,
    votes: votesAgg[0] || { positive: 0, negative: 0 }
  });
});

// Stats per user and admin
router.get('/stats', requireAuth, async (req, res) => {
  const userId = req.user.id;
  const submitted = await query('SELECT COUNT(DISTINCT question_id) as cnt FROM responses WHERE user_id = ?', [userId]);
  const reviewed = await query('SELECT COUNT(*) as cnt FROM feedback WHERE user_id = ?', [userId]);
  // Admin overview
  const formsCount = req.user.role === 'admin' ? await query('SELECT COUNT(*) as cnt FROM forms') : [{ cnt: 0 }];
  const responsesCount = req.user.role === 'admin' ? await query('SELECT COUNT(*) as cnt FROM responses') : [{ cnt: 0 }];
  res.json({
    userSubmitted: submitted[0].cnt,
    userFeedbackAuthored: reviewed[0].cnt,
    totalForms: formsCount[0].cnt,
    totalResponses: responsesCount[0].cnt
  });
});
// Seed sample data (admin)
router.post('/seed', requireAuth, requireAdmin, async (req, res) => {
  // Create a sample form with questions
  const form = await query('INSERT INTO forms (title, description, image_url, created_by) VALUES (?, ?, ?, ?)', [
    'Product Satisfaction Survey',
    'Quick survey about your experience with our product',
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=640&q=80&auto=format&fit=crop',
    req.user.id
  ])
  const formId = form.insertId;
  const questions = [
    { text: 'How satisfied are you with our product?', options: ['Very satisfied','Satisfied','Neutral','Dissatisfied'] },
    { text: 'How likely are you to recommend us?', options: ['Very likely','Likely','Unlikely'] },
    { text: 'Rate the value for money', options: ['Excellent','Good','Fair','Poor'] }
  ];
  for (const q of questions) {
    await query('INSERT INTO questions (form_id, question_text, options) VALUES (?, ?, ?)', [formId, q.text, JSON.stringify(q.options)])
  }

  // Add some feedback items
  const users = await query('SELECT id FROM users LIMIT 1');
  const userId = users.length ? users[0].id : null;
  if (userId) {
    await query('INSERT INTO feedback (user_id, feedback_text, votes) VALUES (?, ?, ?)', [userId, 'Great product!', 5]);
    await query('INSERT INTO feedback (user_id, feedback_text, votes) VALUES (?, ?, ?)', [userId, 'Could be better.', 2]);
    await query('INSERT INTO feedback (user_id, feedback_text, votes) VALUES (?, ?, ?)', [userId, 'Excellent customer service.', 8]);
  }

  res.json({ success: true, formId });
});
router.get('/feedback', requireAuth, requireAdmin, async (req, res) => {
  const { minVotes } = req.query;
  let sql = 'SELECT f.*, u.username FROM feedback f JOIN users u ON f.user_id = u.id';
  const params = [];
  if (minVotes) {
    sql += ' WHERE f.votes >= ?';
    params.push(Number(minVotes));
  }
  sql += ' ORDER BY f.created_at DESC';
  const rows = await query(sql, params);
  res.json(rows);
});

// Submission history: list per user per form with question/answer
router.get('/history', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { formId, userId, limit = 100, offset = 0 } = req.query;

    const filters = [];
    const params = [];
    if (formId) {
      filters.push('q.form_id = ?');
      params.push(Number(formId));
    }
    if (userId) {
      filters.push('r.user_id = ?');
      params.push(Number(userId));
    }

    const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

    const sql = `
      SELECT 
        r.id,
        r.user_id,
        u.username,
        r.question_id,
        q.question_text,
        q.type,
        q.form_id,
        f.title AS form_title,
        r.answer,
        r.created_at
      FROM responses r
      JOIN users u ON r.user_id = u.id
      JOIN questions q ON r.question_id = q.id
      LEFT JOIN forms f ON q.form_id = f.id
      ${whereClause}
      ORDER BY r.created_at DESC
      LIMIT ? OFFSET ?`;

    params.push(Number(limit));
    params.push(Number(offset));

    const rows = await query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load submission history', details: String(err) });
  }
});

// Users overview with submission/feedback counts
router.get('/users', requireAuth, requireAdmin, async (req, res) => {
  const sql = `
    SELECT 
      u.id,
      u.username,
      u.role,
      COALESCE(rc.response_count, 0) AS response_count,
      COALESCE(fc.feedback_count, 0) AS feedback_count,
      COALESCE(lr.last_response_at, NULL) AS last_response_at
    FROM users u
    LEFT JOIN (
      SELECT user_id, COUNT(*) AS response_count FROM responses GROUP BY user_id
    ) rc ON rc.user_id = u.id
    LEFT JOIN (
      SELECT user_id, COUNT(*) AS feedback_count FROM feedback GROUP BY user_id
    ) fc ON fc.user_id = u.id
    LEFT JOIN (
      SELECT user_id, MAX(created_at) AS last_response_at FROM responses GROUP BY user_id
    ) lr ON lr.user_id = u.id
    ORDER BY u.username ASC`;
  const rows = await query(sql);
  res.json(rows);
});

export default router;

