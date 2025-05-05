import { create } from 'zustand';
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { data } from 'react-router-dom';
import { useAuthStore } from './useAuthStore';

export const useChatStore = create((set, get) => ({
    messages: [],
    users: [],
    selectedUser: null,
    isUsersLoading: false,
    isMessagesLoading: false,
    isSendingMessage: false,
    hasUnreadMessages: false,
    unreadMessageUsers: new Set(), // Track users with unread messages

    getUsers: async () => {
        set({ isUsersLoading: true });
        try {
            const response = await axiosInstance.get("/messages/users");
            set({ users: response.data });
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            set({ isUsersLoading: false });
        }
    },

    getMessages: async (userId) => {
        set({ isMessagesLoading: true });
        try {
            const response = await axiosInstance.get(`/messages/${userId}`);
            set({ messages: response.data });
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            set({ isMessagesLoading: false });
        }
    },

    sendMessage: async (messageData) => {
        const { selectedUser, messages } = get();
        set({ isSendingMessage: true });
        try {
            const response = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
            set({ messages: [...messages, response.data] });
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            set({ isSendingMessage: false });
        }
    },

    subscribeToMessages: () => {
        const { selectedUser } = get();

        if (!selectedUser) return;

        const socket = useAuthStore.getState().socket;

        socket.on("newMessage", (newMessage) => {
            const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
            if (!isMessageSentFromSelectedUser) return;
            set({ messages: [...get().messages, newMessage] });
        })
    },

    unsubscribeFromMessages: () => {
        const socket = useAuthStore.getState().socket;
        socket.off("newMessage");
    },

    setSelectedUser: (selectedUser) => {
        // Clear unread status for this user when selected
        if (selectedUser) {
            const unreadUsers = new Set(get().unreadMessageUsers);
            unreadUsers.delete(selectedUser._id);
            set({ 
                selectedUser,
                unreadMessageUsers: unreadUsers
            });
        } else {
            set({ selectedUser });
        }
    },

    resetUnreadMessages: () => set({ hasUnreadMessages: false }),

    clearUnreadForUser: (userId) => {
        const unreadUsers = new Set(get().unreadMessageUsers);
        unreadUsers.delete(userId);
        set({ unreadMessageUsers: unreadUsers });
        
        // If no more unread users, reset global flag
        if (unreadUsers.size === 0) {
            set({ hasUnreadMessages: false });
        }
    },

    subscribeToAllMessages: () => {
        const socket = useAuthStore.getState().socket;
        if (!socket) return;

        socket.on("newMessage", (newMessage) => {
            const myId = useAuthStore.getState().authUser?._id;
            const currentSelectedUser = get().selectedUser;
            
            // Only mark as unread if I'm the receiver and not the sender
            if (newMessage.receiverId === myId && newMessage.senderId !== myId) {
                // Don't mark as unread if we're currently viewing this conversation
                if (!currentSelectedUser || newMessage.senderId !== currentSelectedUser._id) {
                    const unreadUsers = new Set(get().unreadMessageUsers);
                    unreadUsers.add(newMessage.senderId);
                    set({ 
                        hasUnreadMessages: true,
                        unreadMessageUsers: unreadUsers
                    });
                }
            }
        });
    },

    unsubscribeFromAllMessages: () => {
        const socket = useAuthStore.getState().socket;
        if (socket) {
            socket.off("newMessage");
        }
    }
}))