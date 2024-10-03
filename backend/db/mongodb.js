import mongoose from "mongoose";

const connect = async ()=>{
    try {
       await mongoose.connect(process.env.MONGO_URI)
    console.log("Connected to mongodb server")
    } catch (error) {
        console.log(error);
    }
}

export default connect;