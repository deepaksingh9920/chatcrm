const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const prisma = require('../utils/prisma');
const { authenticate } = require('../middleware/auth');

// Register company + owner
router.post('/register', [
  body('companyName').notEmpty().trim(),
  body('name').notEmpty().trim(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { companyName, name, email, password, phone } = req.body;
  try {
    const existingUser = await prisma.user.findFirst({ where: { email, company: { email } } });
    const existingCompany = await prisma.company.findUnique({ where: { email } });
    if (existingCompany) return res.status(400).json({ message: 'Company already registered' });
    const hashed = await bcrypt.hash(password, 12);
    const company = await prisma.company.create({
      data: {
        name: companyName, email, phone,
        users: { create: { name, email, password: hashed, role: 'OWNER' } },
      },
      include: { users: true },
    });
    const user = company.users[0];
    const token = jwt.sign({ userId: user.id, companyId: company.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role }, company: { id: company.id, name: company.name } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findFirst({ where: { email, isActive: true }, include: { company: true } });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ userId: user.id, companyId: user.companyId }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role }, company: { id: user.company.id, name: user.company.name } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current user
router.get('/me', authenticate, (req, res) => {
  const { password, ...user } = req.user;
  res.json({ user, company: req.user.company });
});

module.exports = router;
