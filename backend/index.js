import express from 'express';
import cors from 'cors';
import appRoutes from './routes/routes.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express()
app.use(express.json());
const corsOptions = { origin: process.env.CORS_ORIGIN };

app.use(cors(corsOptions));

appRoutes(app);

app.listen(process.env.PORT,  () => {
  console.log('Example app listening on port ' + process.env.PORT);
})