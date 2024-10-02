import express from 'express'
import dotenv from 'dotenv'
import mongoose from 'mongoose'

const app = express()
dotenv.config()

const port = process.env.PORT 

  
    mongoose.connect(process.env.MONGO_URI)
        .then (()=>{
            console.log("Connected to database")
        })
        .catch ((error)=>{
            console.log(error)
        });
    


app.listen(port,()=>
{
    console.log(`Server is listening on ${port}`)
})