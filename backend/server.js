import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import connect from "./db/mongodb.js";

import authRoute from './routes/auth.route.js'
import userRoute from "./routes/user.route.js"

dotenv.config();
const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use(cookieParser)

app.use('/api/auth',authRoute)
app.use('/api/users',userRoute)

app.listen(port, () => {
  console.log(`Server is listening on ${port}`);
  connect();
});
