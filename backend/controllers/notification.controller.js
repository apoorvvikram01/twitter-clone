import Notification from "../models/notification.model.js";

export const getNotifications = async (req, res) => {
    try {
        const userId = req.user._id;

        const notification = await Notification.findOne({$to : userId}).populate({
            path : " from ",
            select: "username profileImage "
        })

        await Notification.updateMany({$to : userId}, {read: true})
        res.status(200).json(notification)
    } catch (error) {
        res.status(500).json({message: "Internal Server Error"})
        console.log(error.message,"Error in getNotifications controller")
    }
}

export const deleteNotifications = async (req, res) => {
try {
    const userId = req.user._id;

await Notification.deleteMany({$to : userId})

res.status(200).json({message: "Notification deleted successfully "})
} catch (error) {
    res.status(500).json({message: "Internal Server Error"})
    console.log(error.message,"Error in deleteNotifications controller")
}
}