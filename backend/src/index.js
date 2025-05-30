import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/mongodb.js';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize'; // Import the sanitizer
import path from "path";
import authRoutes from "./routes/auth.route.js";
import adminRoutes from "./routes/admin.route.js";
import sectionRoutes from "./routes/section.route.js";
import teacherRoutes from "./routes/teacher.route.js";
import classRoutes from "./routes/class.route.js";
import studentRoutes from "./routes/student.route.js";
import messageRoutes from "./routes/message.route.js";
import { app, server } from "./config/socket.js";
import configRoutes from "./routes/config.route.js";

dotenv.config();

const PORT = process.env.PORT;

const __dirname = path.resolve();
const corsOptions = { 
  origin: "http://localhost:5173",
  credentials: true,
};

app.use(express.json({limit: '50mb'}));
app.use(cookieParser());
app.use(cors(corsOptions));

// Apply the mongo sanitization middleware
// This will remove any keys/values that contain prohibited MongoDB operators like $, .
app.use(mongoSanitize({
  replaceWith: '_', // Optional: replace prohibited characters with this
  onSanitize: ({ req, key }) => {
    console.warn(`This request[${key}] is sanitized`, req);
  }
}));

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/section', sectionRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/class', classRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/config', configRoutes);

if(process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  })
}

server.listen(PORT,  () => {
  connectDB();
  console.log(`Server is running on port ${PORT}`);
})