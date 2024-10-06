import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import connect from "./db/mongodb.js";
import {v2 as cloudinary} from 'cloudinary'

import authRoute from './routes/auth.route.js'
import userRoute from "./routes/user.route.js"
import postRoute from "./routes/post.route.js"
import notificationRoute from "./routes/notification.route.js"



dotenv.config();
cloudinary.config({
  cloud_name : process.env.CLOUDINARY_CLOUD_NAME,
  api_key : process.env.CLOUDINARY_API_KEY,
  api_secret : process.env.CLOUDINARY_API_SECRET
});


const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use(cookieParser)

app.use('/api/auth',authRoute)
app.use('/api/users',userRoute)
app.use('/api/posts',postRoute)
app.use('/api/notifications',notificationRoute)

app.listen(port, () => {
  console.log(`Server is listening on ${port}`);
  connect();
});
