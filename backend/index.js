import express from 'express';
import cors from 'cors';
import appRoutes from './routes/routes.js';
import dotenv from 'dotenv';
import connectDB from './config/mongodb.js';
import cookieParser from 'cookie-parser';

dotenv.config();

const app = express()
app.use(express.json());

const corsOptions = { 
  origin: "http://localhost:5173",
  credentials: true,
};

app.use(cors(corsOptions));
app.use(cookieParser());

appRoutes(app);

app.listen(process.env.PORT,  () => {
  connectDB();
  console.log('Example app listening on port ' + process.env.PORT);
})