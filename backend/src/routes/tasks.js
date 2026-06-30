const router = require('express').Router({ mergeParams: true });
const prisma = require('../utils/prisma');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      where: { customerId: req.params.customerId },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, name: true } } },
    });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { title, description, dueDate } = req.body;
    if (!title) return res.status(400).json({ message: 'Title required' });
    const task = await prisma.task.create({
      data: { customerId: req.params.customerId, userId: req.user.id, title, description, dueDate: dueDate ? new Date(dueDate) : null },
      include: { user: { select: { id: true, name: true } } },
    });
    await prisma.timeline.create({
      data: { customerId: req.params.customerId, type: 'TASK_CREATED', title: `Task created: ${title}`, meta: { taskId: task.id } },
    });
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { status, title, description, dueDate } = req.body;
    const task = await prisma.task.update({
      where: { id: req.params.id },
      data: { status, title, description, dueDate: dueDate ? new Date(dueDate) : undefined },
      include: { user: { select: { id: true, name: true } } },
    });
    if (status === 'COMPLETED') {
      await prisma.timeline.create({
        data: { customerId: req.params.customerId, type: 'TASK_COMPLETED', title: `Task completed: ${task.title}`, meta: { taskId: task.id } },
      });
    }
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await prisma.task.delete({ where: { id: req.params.id } });
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
