import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import { cloudinary } from '../config/cloudinary.js';
import { getReceiverSocketId } from "../config/socket.js";
import { io } from "../config/socket.js";

const getUsersForSidebar = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;
        const filteredUsers = await User.find({ _id: { $ne: loggedInUserId }, accountStatus: "Verified" }).select("-password");
        res.status(200).json(filteredUsers);

    } catch (error) {
        console.error("Error in getUsersForSidebar: ", error.message);
        res.status(500).json({ message: error.message });
    }
}

const getMessages = async (req, res) => {
    try {
        const { id: userToChatId } = req.params;
        const myId = req.user._id;

        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: userToChatId },
                { senderId: userToChatId, receiverId: myId }
            ]
        })

        // Mark messages as read when user opens the conversation
        await Message.updateMany(
            { senderId: userToChatId, receiverId: myId, status: 'Unread' },
            { status: 'Read' }
        );

        res.status(200).json(messages);

    } catch (error) {
        console.error("Error in getMessages: ", error.message);
        res.status(500).json({ message: error.message });
    }
}

const sendMessage = async (req, res) => {
    try {
        const { text, image } = req.body;
        const { id: receiverId } = req.params;
        const senderId = req.user._id;

        let imageUrl;
        if (image) {
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image: imageUrl,
            status: 'Unread'
        });

        await newMessage.save();

        const receiverSocketId = getReceiverSocketId(receiverId);
        console.log("Receiver Socket ID: ", receiverSocketId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }

        res.status(201).json(newMessage);
    } catch (error) {
        console.error("Error in sendMessage: ", error.message);
        res.status(500).json({ message: error.message });
    }
}

const getUnreadMessages = async (req, res) => {
    try {
        const userId = req.user._id;

        // Get all unread messages where user is the receiver
        const unreadMessages = await Message.find({
            receiverId: userId,
            status: 'Unread'
        }).sort({ createdAt: -1 });

        // Group messages by sender for notification purposes
        const senderIds = [...new Set(unreadMessages.map(message => message.senderId.toString()))];

        // Get sender details
        const senders = await User.find({
            _id: { $in: senderIds }
        }).select('firstName lastName profilePic');

        // Create sender map
        const senderMap = {};
        senders.forEach(sender => {
            senderMap[sender._id.toString()] = {
                _id: sender._id,
                firstName: sender.firstName,
                lastName: sender.lastName,
                profilePic: sender.profilePic
            };
        });

        // Group messages by sender
        const messagesBySender = {};
        unreadMessages.forEach(message => {
            const senderId = message.senderId.toString();
            if (!messagesBySender[senderId]) {
                messagesBySender[senderId] = {
                    sender: senderMap[senderId],
                    messages: []
                };
            }
            messagesBySender[senderId].messages.push(message);
        });

        res.status(200).json({
            unreadMessages,
            messagesBySender,
            senderIds
        });
    } catch (error) {
        console.error("Error in getUnreadMessages: ", error.message);
        res.status(500).json({ message: error.message });
    }
};

const markMessagesAsRead = async (req, res) => {
    try {
        const { senderId } = req.params;
        const receiverId = req.user._id;

        // Update all unread messages from this sender to this receiver
        const result = await Message.updateMany(
            { senderId, receiverId, status: 'Unread' },
            { status: 'Read' }
        );

        res.status(200).json({
            message: "Messages marked as read",
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        console.error("Error in markMessagesAsRead: ", error.message);
        res.status(500).json({ message: error.message });
    }
};

export const messageRoutes = {
    getUsersForSidebar,
    getMessages,
    sendMessage,
    getUnreadMessages,
    markMessagesAsRead
}
