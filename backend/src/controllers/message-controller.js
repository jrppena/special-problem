import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import {cloudinary} from '../config/cloudinary.js';
import { getReceiverSocketId } from "../config/socket.js";
import {io} from "../config/socket.js";

const getUsersForSidebar = async (req, res) => {
    try{
        const loggedInUserId = req.user._id;
        const filteredUsers = await User.find({_id: {$ne: loggedInUserId}, accountStatus:"Verified"}).select("-password");
        res.status(200).json(filteredUsers);

    }catch(error){
        console.error("Error in getUsersForSidebar: ", error.message);
        res.status(500).json({message: error.message});
    }
}

const getMessages = async(req, res) => {
    try{
        const {id:userToChatId} = req.params;
        const myId = req.user._id;

        const messages = await Message.find({
            $or: [
                {senderId: myId, receiverId: userToChatId},
                {senderId: userToChatId, receiverId: myId}
            ]
        })
        res.status(200).json(messages);

    }catch(error){
        console.error("Error in getMessages: ", error.message);
        res.status(500).json({message: error.message});
    }
}

const sendMessage = async(req, res) => {
    try{
       const {text,image} = req.body;
       const {id:receiverId} = req.params;
        const senderId = req.user._id; 
        
        let imageUrl;
        if(image){
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image: imageUrl
        });

        await newMessage.save();

        const receiverSocketId = getReceiverSocketId(receiverId);
        if(receiverSocketId){
            io.to(receiverSocketId).emit("newMessage",newMessage);
        }

        res.status(201).json(newMessage);
    }catch(error){
        console.error("Error in sendMessage: ", error.message);
        res.status(500).json({message: error.message});
    }
}

export const messageRoutes = {
    getUsersForSidebar,
    getMessages,
    sendMessage
}
