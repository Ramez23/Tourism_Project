const dotenv = require('dotenv');

// ✅ Load `.env` only in development, avoid errors in production
if (process.env.NODE_ENV !== 'production') {
  const result = dotenv.config({ path: './.env' });
  if (result.error) {
    console.warn(
      '⚠️ Warning: Missing .env file, using system environment variables.'
    );
  }
}

console.log(
  '🔍 JWT_SECRET:',
  process.env.JWT_SECRET ? 'Loaded ✅' : '❌ MISSING'
);
console.log('🔍 DATABASE:', process.env.DATABASE ? 'Loaded ✅' : '❌ MISSING');

const mongoose = require('mongoose');
const app = require('./app');

// 🔴 Handle Uncaught Exceptions (Synchronous Errors)
process.on('uncaughtException', err => {
  console.error('🚨 UNCAUGHT EXCEPTION! Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

// ✅ Connect to MongoDB (Ensure ENV Variables Exist)
mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log('✅ DB Connection Successful!'))
  .catch(err => {
    console.error('❌ MongoDB Connection Failed:', err.message);
    process.exit(1);
  });

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}...`);
});

// 🔴 Handle Unhandled Promise Rejections (Asynchronous Errors)
process.on('unhandledRejection', err => {
  console.error('🚨 UNHANDLED REJECTION! Shutting down...');
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
