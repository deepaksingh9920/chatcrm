require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();

app.use(helmet());
app.use(cors({ origin: '*', credentials: true }));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/search', require('./routes/search'));
app.use('/api/customers', require('./routes/customers'));
app.use('/api/customers/:customerId/messages', require('./routes/messages'));
app.use('/api/customers/:customerId/quotes', require('./routes/quotes'));
app.use('/api/customers/:customerId/orders', require('./routes/orders'));
app.use('/api/customers/:customerId/invoices', require('./routes/invoices'));
app.use('/api/customers/:customerId/tasks', require('./routes/tasks'));
app.use('/api/customers/:customerId/notes', require('./routes/notes'));
app.use('/api/customers/:customerId/timeline', require('./routes/timeline'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`ChatCRM API running on port ${PORT}`));

module.exports = app;
