import bcrypt from "bcryptjs"
import {v2 as cloudinary} from "cloudinary"


import Notification from "../models/notification.model.js"
import User from "../models/user.model.js"
export const getUserProfile = async (req,res)=>{
    const {username} = req.params
    try {
        const user = await User.findOne({username}).select("-password")
        if(!user) {
            res.status(404).json({
                message:"User not found"
            })
        }
        res.status(200).json(user) 
    } catch (error) {
        res.status(500).json({message:"Internal server error"})
        console.log("Problem in getUserProfile controller",error.message)
    }
}

export const followUnfollowUser = async (req,res)=>{
    try {
        const {id} = req.params
        const userToModify = await User.findById(id)
        const currentUser = await User.findById(req.user._id)
        if(id === req.user.id.toString()){
            res.status(400).json({
                message: " You can't follow/unfollow yourself"
            })
        }
        if(!userToModify || !currentUser){
           return res.status(404).json({
                message: "User not found"
            })
        }

        const isFollowing = currentUser.following.includes(id)
        if(isFollowing){
            // Unfollow the user
            await User.findByIdAndUpdate(id,{$pull : {followers: req.user._id}})
            await User.findByIdAndUpdate(req.user._id,{$pull: {following: id}})
            res.status(200).json({message: "User unfollowed successfully"})
        }
        else{
            // Follow the user
            await User.findByIdAndUpdate(id,{$push : {followers: req.user._id}})
            await User.findByIdAndUpdate(req.user._id,{$push: {following: id}})
            res.status(200).json({message: "User folllowed successfully"})

            const newNotification = new Notification({
                type : "follow",
                from : req.user._id,
                to : userToModify._id
            })
            await newNotification.save()
        }
    } catch (error) {
        res.status(500).json({message:"Internal server error"})
        console.log("Problem in followUnfollowUser controller",error.message)
    }
}

export const getSuggestedUsers = async (req, res) => {
   try {
    const userId = req.user._id;
    const userFollowedByMe = await User.findById(userId).select("following") 

    const users = await User.aggregate([
        {
            $match: {
                _id: {$ne : userId}
            }
        },{sample : {size : 10}}
    ])

    const filteredUsers = users.filter(user => !userFollowedByMe.following.includes(user._id))
    const suggestedUsers = filteredUsers.slice(0,4)

    suggestedUsers.forEach(user => user.password = null)
    res.status(200).json(suggestedUsers)
   } catch (error) {
    res.status(500).json({
        message: "Internal Server error"
    })
    console.log(error.message)
   }
}

export const updateUser = async (req,res) => {
    const {username,email,fullName,currentPassword,newPassword,bio,link} = req.body
    let{profileImage,coverImage} = req.body

    const userId = req.user._id

    try {
        let user = await User.findById(userId)
        if(!user){
            res.status(404).json({message: 'User not found'})
        }

        if((!newPassword && currentPassword ) || (!currentPassword && newPassword)){
            res.status(400).json({
                message: "Please provide both the current and the new password"
            })
        }
        if(currentPassword && newPassword){
            const isMatch = await bcrypt.compare(currentPassword,user.password)
            if(!isMatch){
                res.status(400).json({message:"Password mismatched"})
            }
            if(newPassword.length <6){
                res.status(400).json({message:"Password must be at least 6 characters"})
            }
        }

        user.password = await bcrypt.hash(newPassword,10)

        if(profileImage){
            if(user.profileImage){
                await cloudinary.uploader.destroy(user.profileImage).split('/').pop().split('.')[0]
            }
         const uploadedResponse =  await  cloudinary.uploader.upload(profileImage)
         profileImage = uploadedResponse.secure_url;
        }
        if(coverImage){
            if(user.coverImage){
                await cloudinary.uploader.destroy(user.coverImage).split('/').pop().split('.')[0]
            }
            const uploadedResponse =  await  cloudinary.uploader.upload(coverImage)
            coverImage = uploadedResponse.secure_url;
        }

        user.fullName = fullName || user.fullName;
        user.email = email || user.email
        user.username = username || user.username
        user.bio = bio || user.bio
        user.profileImage = profileImage || user.profileImage
        user.coverImage = coverImage || user.coverImage
        user.link = link || user.link

        user = await user.save()

        user.password = null

        return res.status(201).json(user)

    } catch (error) {
        
    }
}