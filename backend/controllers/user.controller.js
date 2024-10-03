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