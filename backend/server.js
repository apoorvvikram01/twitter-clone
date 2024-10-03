import express from "express";
import dotenv from "dotenv";
import connect from "./db/mongodb.js";
import authRoute from './routes/auth.route.js'

const app = express();
dotenv.config();

const port = process.env.PORT;

app.use('/api',authRoute)

app.listen(port, () => {
  console.log(`Server is listening on ${port}`);
  connect();
});
