const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const customerRoutes = require('./routes/customers');
const messageRoutes = require('./routes/messages');
const quoteRoutes = require('./routes/quotes');
const orderRoutes = require('./routes/orders');
const invoiceRoutes = require('./routes/invoices');
const taskRoutes = require('./routes/tasks');
const noteRoutes = require('./routes/notes');
const dashboardRoutes = require('./routes/dashboard');
const searchRoutes = require('./routes/search');
const fileRoutes = require('./routes/files');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/customers', messageRoutes);
app.use('/api/customers', quoteRoutes);
app.use('/api/customers', orderRoutes);
app.use('/api/customers', invoiceRoutes);
app.use('/api/customers', taskRoutes);
app.use('/api/customers', noteRoutes);
app.use('/api/customers', fileRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/search', searchRoutes);

app.get('/api/health', (_, res) => res.json({ status: 'ok' }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`ChatCRM backend running on port ${PORT}`);
});
