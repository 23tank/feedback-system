import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';

const router = Router();

router.post('/register', async (req, res) => {
  try {
    const { username, password, role } = req.body;
    if (!username || !password) return res.status(400).json({ message: 'username and password required' });
    const userRows = await query('SELECT id FROM users WHERE username = ?', [username]);
    if (userRows.length) return res.status(409).json({ message: 'Username already exists' });
    const hash = await bcrypt.hash(password, 10);
    const insert = await query('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [username, hash, role === 'admin' ? 'admin' : 'user']);
    const userId = insert.insertId;
    return res.status(201).json({ id: userId, username, role: role === 'admin' ? 'admin' : 'user' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: 'username and password required' });
    const users = await query('SELECT * FROM users WHERE username = ?', [username]);
    if (!users.length) return res.status(401).json({ message: 'Invalid credentials' });
    const user = users[0];
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    return res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Server error' });
  }
});

export default router;

