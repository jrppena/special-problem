import React from 'react';
import Navbar from '../components/navigation-bar';
import { useChatStore } from '../store/useChatStore';
import Sidebar from '../components/side-bar';
import ChatContainer from '../components/chat-container';
import NoChatSelected from '../components/no-chat-selected';


const MessagePage = () => {
    const {selectedUser} = useChatStore();

    return (
        <>
            <Navbar/>
            <div className="h-screen bg-base-200">
                <div className="flex items-center justify-center pt-20 px-4">
                    <div className="bg-base-100 rounded-lg shadow-cl w-full max-w-6xl h-[calc(100vh-8rem)]">
                        <div className="flex h-full rounded-lg overflow-hidden">
                            <Sidebar/>
                            {!selectedUser? <NoChatSelected /> : <ChatContainer />}

                        </div>
                    </div>
                    
                </div>
                
            </div>
        </>
       
    );
}

export default MessagePage;