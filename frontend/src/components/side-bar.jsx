import React from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { useEffect, useState } from "react";
import SidebarSkeleton from "./skeleton/sidebar-skeleton";
import { Users } from "lucide-react";

const SideBar = () => {
    const {getUsers, users, selectedUser, setSelectedUser, isUsersLoading} = useChatStore();

    const {onlineUsers} = useAuthStore();

    const [showOnlineOnly, setShowOnlineOnly] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    
    useEffect(() => {
        getUsers();
    }, [getUsers]);

    const filteredUsers = users
    .filter((user) => !showOnlineOnly || onlineUsers.includes(user._id)) // Show online users only if enabled
    .filter((user) => {
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase(); // Combine first and last names
    return fullName.includes(searchTerm.toLowerCase());
  });

  
    if(isUsersLoading) return <SidebarSkeleton/>

    return(
        <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
            <div className="border-b border-base-300 w-full p-5">
                <div className="flex items-center gap-2">
                    <Users className="size-6"/>
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
                    <input type="search" className="grow" placeholder="Search" onChange={(e)=>setSearchTerm(e.target.value)}/>
                </label>
            </div>
            <div className="overflow-y-auto w-full py-3">
                {filteredUsers.map((user) => (
                    <button
                        key={user._id}
                        onClick={() => setSelectedUser(user)}
                        className={`w-full p-3 flex items-center gap-3 hover:bg-base-300 transition-colors ${selectedUser?._id === user._id ? 'bg-base-300 ring-1 ring-base-300' : ''}`}
                    >
                    <div className="relative mx-auto lg:mx-0">
                        <img src={user.profilePic || "/avatar.png"} alt={user.firstName} className="size-12 object-cover rounded-full" />
                        {
                            onlineUsers.includes(user._id) && (
                                <span className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full ring-2 ring-zinc-900"/>
                            )
                        }
                    </div>

                    {/* User info - only visible on larger screens */}
                    <div className="hidden lg:block text-left min-w-0">
                        <div className="font-medium truncate">{user.firstName} {user.lastName}</div>
                        <div className="text-sm text-zinc-400">
                            {onlineUsers.includes(user._id) ? "Online": "Offline"}
                        </div>
                    </div>
                    </button>
                ))}
                
                 {filteredUsers.length === 0 && (
                    <div className="text-center text-zinc-500 py-4">No online users</div>
                )}
            </div>

        </aside>
    )
}
export default SideBar;