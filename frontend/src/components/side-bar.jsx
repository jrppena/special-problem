import React from 'react';
import { useChatStore } from '../store/useChatStore';
import { useAuthStore } from '../store/useAuthStore';
import { useEffect, useState } from 'react';
import SidebarSkeleton from './skeleton/sidebar-skeleton';
import { Users, ArrowLeft, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SideBar = () => {
    const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading, unreadMessageUsers } = useChatStore();
    const { onlineUsers } = useAuthStore();
    const navigate = useNavigate();

    const [showOnlineOnly, setShowOnlineOnly] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        getUsers();
    }, [getUsers]);

    const handleGoBack = () => {
        navigate(-1);
    };

    // Filter users based on online status and search term
    const filteredUsers = users
        .filter((user) => !showOnlineOnly || onlineUsers.includes(user._id))
        .filter((user) => {
            const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
            return fullName.includes(searchTerm.toLowerCase());
        });

    // Sort users: Unread messages first, then online users, then others
    const sortedUsers = [...filteredUsers].sort((a, b) => {
        // First priority: users with unread messages
        const aHasUnread = unreadMessageUsers.has(a._id);
        const bHasUnread = unreadMessageUsers.has(b._id);

        if (aHasUnread && !bHasUnread) return -1;
        if (!aHasUnread && bHasUnread) return 1;

        // Second priority: online users
        const aIsOnline = onlineUsers.includes(a._id);
        const bIsOnline = onlineUsers.includes(b._id);

        if (aIsOnline && !bIsOnline) return -1;
        if (!aIsOnline && bIsOnline) return 1;

        // Third priority: alphabetic by name
        return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
    });

    if (isUsersLoading) return <SidebarSkeleton />

    return (
        <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
            <div className="border-b border-base-300 w-full p-5">
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleGoBack}
                        className="hover:bg-base-200 p-1 rounded-full"
                    >
                        <ArrowLeft className="size-5" />
                    </button>
                    <Users className="size-6" />
                    <span className="font-medium hidden lg:block">Contacts</span>
                </div>
                <div className="mt-3 hidden lg:flex items-center gap-2">
                    <label className="cursor-pointer flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={showOnlineOnly}
                            onChange={(e) => setShowOnlineOnly(e.target.checked)}
                            className="checkbox checkbox-sm"
                        />
                        <span className="text-sm">Show online only</span>
                    </label>
                    <span className="text-xs text-zinc-500">({onlineUsers.length - 1} online)</span>
                </div>
                <label className="input mt-3 hidden lg:flex items-center gap-2">
                    <svg className="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2.5" fill="none" stroke="currentColor"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></g></svg>
                    <input type="search" className="grow" placeholder="Search" onChange={(e) => setSearchTerm(e.target.value)} />
                </label>
            </div>
            <div className="overflow-y-auto w-full py-3">
                {sortedUsers.map((user) => (
                    <button
                        key={user._id}
                        onClick={() => setSelectedUser(user)}
                        className={`w-full p-3 flex items-center gap-3 hover:bg-base-300 transition-colors ${selectedUser?._id === user._id ? 'bg-base-300 ring-1 ring-base-300' : ''}`}
                    >
                        <div className="relative mx-auto lg:mx-0">
                            <img src={user.profilePic || "/avatar.png"} alt={user.firstName} className="size-12 object-cover rounded-full" />
                            {onlineUsers.includes(user._id) && (
                                <span className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full ring-2 ring-zinc-900" />
                            )}
                            {unreadMessageUsers.has(user._id) && (
                                <span className="absolute top-0 right-0 size-4 bg-red-500 rounded-full ring-2 ring-zinc-900 flex items-center justify-center">
                                    <MessageSquare className="size-2 text-white" />
                                </span>
                            )}
                        </div>

                        {/* User info - only visible on larger screens */}
                        <div className="hidden lg:block text-left min-w-0">
                            <div className="font-medium truncate">
                                {user.firstName} {user.lastName}
                                {unreadMessageUsers.has(user._id) && (
                                    <span className="ml-2 inline-flex items-center justify-center size-5 bg-red-500 text-white text-xs rounded-full">
                                        !
                                    </span>
                                )}
                            </div>
                            <div className="text-sm text-zinc-400">
                                {onlineUsers.includes(user._id) ? "Online" : "Offline"}
                            </div>
                        </div>
                    </button>
                ))}

                {sortedUsers.length === 0 && (
                    <div className="text-center text-zinc-500 py-4">No online users</div>
                )}
            </div>
        </aside>
    )
}

export default SideBar;