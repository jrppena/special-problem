import express from 'express';
import cors from 'cors';
import appRoutes from './routes/routes.js';
import dotenv from 'dotenv';
import connectDB from './config/mongodb.js';
import cookieParser from 'cookie-parser';
import path from "path";

dotenv.config();

const app = express()
app.use(express.json());
const __dirname = path.resolve();
const corsOptions = { 
  origin: "http://localhost:5173",
  credentials: true,
};

app.use(cors(corsOptions));
app.use(cookieParser());

appRoutes(app);

if(process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '/frontend/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  })
}

app.listen(process.env.PORT,  () => {
  connectDB();
  console.log('Example app listening on port ' + process.env.PORT);
})