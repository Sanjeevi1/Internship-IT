import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import morgan from 'morgan';
import authRoutes from './routes/auth';
import internshipRoutes from './routes/internship';
import odRoutes from './routes/od';
import announcementRoutes from './routes/announcement';
import { errorHandler } from './middleware/errorHandler';
import { protect as authMiddleware } from './middleware/auth';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev')); // Log requests to console

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/internships', authMiddleware, internshipRoutes);
app.use('/api/od', authMiddleware, odRoutes);
app.use('/api/announcements', authMiddleware, announcementRoutes);

// Error Handler
app.use(errorHandler);

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/internship-portal';

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }); 