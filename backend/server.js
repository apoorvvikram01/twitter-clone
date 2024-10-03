import express from "express";
import dotenv from "dotenv";
import connect from "./db/mongodb.js";
import authRoute from './routes/auth.route.js'
import cookieParser from "cookie-parser";

dotenv.config();
const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use(cookieParser)

app.use('/api/auth',authRoute)

app.listen(port, () => {
  console.log(`Server is listening on ${port}`);
  connect();
});
