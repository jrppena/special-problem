import { create } from 'zustand';
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
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
    isOnMessagePage: false, // Track if user is on message page

    // Set when user enters/leaves message page
    setOnMessagePage: (isOnPage) => {
        set({ isOnMessagePage: isOnPage });
    },

    getUsers: async () => {
        set({ isUsersLoading: true });
        try {
            const response = await axiosInstance.get("/messages/users");
            set({ users: response.data });
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to fetch users");
        } finally {
            set({ isUsersLoading: false });
        }
    },

    getMessages: async (userId) => {
        set({ isMessagesLoading: true });
        try {
            const response = await axiosInstance.get(`/messages/${userId}`);
            set({ messages: response.data });

            // Remove user from unread messages set since we've now read their messages
            const unreadUsers = new Set(get().unreadMessageUsers);
            unreadUsers.delete(userId);
            set({ unreadMessageUsers: unreadUsers });

            // If no more unread users, reset global notification flag
            if (unreadUsers.size === 0) {
                set({ hasUnreadMessages: false });
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to fetch messages");
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
            toast.error(error?.response?.data?.message || "Failed to send message");
        } finally {
            set({ isSendingMessage: false });
        }
    },

    subscribeToMessages: () => {
        const { selectedUser } = get();
        const socket = useAuthStore.getState().socket;

        if (!socket) return;

        // Always clean up previous subscription to avoid duplicates
        socket.off("newMessage");

        socket.on("newMessage", (newMessage) => {
            const myId = useAuthStore.getState().authUser?._id;
            const currentSelectedUser = get().selectedUser;

            // Don't proceed if this message isn't for the current user
            if (newMessage.receiverId !== myId) return;

            // If we have a selected user conversation and the message is from them,
            // add it to the current chat
            if (currentSelectedUser && newMessage.senderId === currentSelectedUser._id) {
                // Add message to the current conversation
                set({ messages: [...get().messages, newMessage] });

                // Automatically mark the message as read since we're viewing the conversation
                axiosInstance.patch(`/messages/read/${newMessage.senderId}`).catch(error => {
                    console.error("Failed to mark message as read:", error);
                });
            } else {
                // Message is from someone else or we don't have a chat open
                // Mark it as unread and update the notification
                const unreadUsers = new Set(get().unreadMessageUsers);
                unreadUsers.add(newMessage.senderId);
                set({
                    hasUnreadMessages: true,
                    unreadMessageUsers: unreadUsers
                });
            }
        });
    },

    unsubscribeFromMessages: () => {
        const socket = useAuthStore.getState().socket;
        if (socket) {
            socket.off("newMessage");
        }
    },

    setSelectedUser: (selectedUser) => {
        // Clear unread status for this user when selected
        if (selectedUser) {
            // Mark messages from this user as read in the database
            axiosInstance.patch(`/messages/read/${selectedUser._id}`).catch(error => {
                console.error("Failed to mark messages as read:", error);
            });

            const unreadUsers = new Set(get().unreadMessageUsers);
            unreadUsers.delete(selectedUser._id);

            set({
                selectedUser,
                unreadMessageUsers: unreadUsers
            });

            // If no more unread users, reset global flag
            if (unreadUsers.size === 0) {
                set({ hasUnreadMessages: false });
            }
        } else {
            set({ selectedUser });
        }
    },

    resetUnreadMessages: () => set({ hasUnreadMessages: false }),

    clearUnreadForUser: (userId) => {
        // Mark messages from this user as read in the database
        axiosInstance.patch(`/messages/read/${userId}`).catch(error => {
            console.error("Failed to mark messages as read:", error);
        });

        const unreadUsers = new Set(get().unreadMessageUsers);
        unreadUsers.delete(userId);
        set({ unreadMessageUsers: unreadUsers });

        // If no more unread users, reset global flag
        if (unreadUsers.size === 0) {
            set({ hasUnreadMessages: false });
        }
    },

    // Check for unread messages from the server
    checkUnreadMessages: async () => {
        try {
            const response = await axiosInstance.get('/messages/unread/all');

            if (response.data.senderIds && response.data.senderIds.length > 0) {
                // Create a new Set with the sender IDs
                const unreadUsers = new Set(response.data.senderIds);

                set({
                    hasUnreadMessages: unreadUsers.size > 0,
                    unreadMessageUsers: unreadUsers
                });
            }
        } catch (error) {
            console.error("Failed to fetch unread messages:", error);
        }
    },

    subscribeToAllMessages: () => {
        const socket = useAuthStore.getState().socket;
        if (!socket) return;

        // Always clean up previous subscription to avoid duplicates
        socket.off("newMessage");

        socket.on("newMessage", (newMessage) => {
            const myId = useAuthStore.getState().authUser?._id;
            const currentSelectedUser = get().selectedUser;

            // Only process messages where I'm the receiver and not the sender
            if (newMessage.receiverId === myId && newMessage.senderId !== myId) {
                // If we're currently viewing a conversation with this sender, mark as read
                if (currentSelectedUser && newMessage.senderId === currentSelectedUser._id) {
                    // Mark the message as read in the database
                    axiosInstance.patch(`/messages/read/${newMessage.senderId}`).catch(error => {
                        console.error("Failed to mark message as read:", error);
                    });

                    // Update messages in the current conversation view
                    set({ messages: [...get().messages, newMessage] });
                } else {
                    // Otherwise, add to unread users set
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