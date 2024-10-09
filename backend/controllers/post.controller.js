import {v2 as cloudinary} from "cloudinary"

import User from "../models/user.model.js";
import Post from "../models/post.model.js";
import Notification from "../models/notification.model.js";

export const createPost = async (req,res)=>{
   try {
    const {text} = req.body;
    let {image} = req.body;

    const userId = req.user._id.toString()
    const user = await User.findById(userId)
    if(!user){
        res.status(404).json({
            message:"User not found"
        })
    }
    if(!text && !image){
        res.status(400).json({
            message:"Text or image is required"
        })
    }

    if(image){
        const uploadedResponse = await cloudinary.uploader.upload(image)
        image = uploadedResponse.secure_url;
    }
    const newPost = new Post(
        {
            user:userId,
            image,
            text
        }
    )

    await newPost.save()
    res.status(201).json(newPost)
   } catch (error) {
    res.status(500).json({message:"Internal Server Error"})
    console.log("Problem in create post controller",error.message)
   }
}

export const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
        if(!post){
            res.status(404).json({
                message:"Post not found"
            })
        }
        if(post.user.toString() !== req.user._id.toString()){
            res.status(401).json({
                message: "You are not authorised to delete this post"
            })
        }
        if(post.image){
            const imageId = post.image.split('/').pop().split('.')[0]
            await cloudinary.uploader.destroy(imageId)
        }
        await Post.findByIdAndDelete(req.params.id)
        res.status(200).json({
            message: "Post deleted successfully"
        })
    } catch (error) {
        res.status(500).json({message:"Internal Server error"})
        console.log("Problem in delete post controller", errror.message)
    }
}

export const commentOnPost = async (req, res) => {
    try {
        const {text} = req.body
        const postId = req.params.id;
        const userId = req.user._id;

        if(!text){
            res.status(400).json({
                message:"Text is required"
            })
        }

        const post = await Post.findById(postId)
        if(!post){
            res.status(404).json({
                message: "Post not found"
            })
        }
        const comment = {user: userId, text}
        post.comments.push(comment)
        await post.save()

        res.status(201).json(post)
    } catch (error) {
        res.status(500).json({message:"Internal Server error"})
        console.log("Problem in comment post controller", errror.message)
    }
}

export const likeUnlikePost = async (req, res) => {
    try {
        const userId = req.user._id
    const postId = req.params.id;

    const post = await Post.findById(postId);
    if(!post){
        res.status(404).json({
            message:"Post not found",
        })
    }
    const userLikedPost = post.likes.includes(userId)
    
    if(userLikedPost){
        //Unlike post
        await Post.updateOne({_id:postId}, {$pull : {likes: userId}})
        await User.updateOne({_id:userId}, {$pull : {likedPost:userId}})

        const updatedLikes = post.likes.filter((id) => id.toString() !== userId.toString())
        res.status(200).json(updatedLikes)


    }
    else{
        //Like post
        post.likes.push(userId)
        await User.updateOne({_id:userId},{$push: {likedPost:userId}})
        await post.save()
    }

    const notification = new Notification({
        from : userId,
        to: post.user,
        type: "like"
    })
    await notification.save()

    const updatedLikes = post.likes
    res.status(200).json(updatedLikes)
    } catch (error) {
        res.status(500).json({message:"Internal Server error"})
        console.log("Problem in like/unlike post controller", errror.message)
    }
}

export const getAllPosts = async (req, res) =>{
    try {
        const posts = await Post.find().sort({createdAt : -1}).populate({
            path: "user",
            select : "-password"
        }).populate({
            path: "comments.user",
            select: "-password"
        })

        if(post.length === 0){
            res.status(200).json([])
        }
        res.status(200).json(posts)
    } catch (error) {
        res.status(500).json({message:"Internal Server error"})
        console.log("Problem in get all post controller", errror.message)
    }
}

export const getLikedPosts = async (req, res) => {
    const userId = req.params.id;

    try {
        const user = await User.findById(userId);
        if(!user){
            res.status(404).json({message:"User not found"})
        }

        const likedPosts = await User.find({_id:{$in: user.likedPost}})
        .populate({
            path: "user",
            select: "-password"
        }).populate({
            path: "comments.user",
            select: "-password"
        })

        res.status(200).json(likedPosts)
    } catch (error) {
        res.status(500).json({message:"Internal Server error"})
        console.log("Problem in get all likes controller", errror.message)
    }
}

export const getFollowingPosts = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);
        if(!user) {
            res.status(404).json({message : "User not found"})
        }

        const following = user.following;

        const feedPosts = await Post.findOne({user: {$in : following}})
        .sort({createdAt: -1}).populate({
            path : "user",
            select: "-password"
        }).populate({
            path : "comments.user",
            select: "-password"
        })
        res.status(200).json({feedPosts})
    } catch (error) {
        res.status(500).json({message : "Internal Server Error"})
        console.log(error.message, " Error in getFollowingPost controller")

    }
}

export const getUserPosts = async(req, res) => {
    try {
        const {username} = req.params;

        const user = await User.findOne({username})
        if(!user){
            res.status(404).json({message: "User not found"})
        }

        const posts = await Post.findOne({user : user._id}).sort({createdAt: -1}).populate({
            path: "user",
            select: "-password"
        }).populate({
            path: "comments.user",
            select: "-password"
        })
        res.status(200).json({posts})
    } catch (error) {
        res.status(500).json({message: "Internal Server Error"})
        console.log(error.message,"Error in getUserPosts controller")
    }
}