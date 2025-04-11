import React from "react";
import { Mail, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

const Navbar = () => {
  const navigate = useNavigate();
  const { authUser, logout } = useAuthStore();
  
  const handleLogout = () => {
    logout();
  }

  return (
    <nav className="bg-gray-100 border-b border-gray-300 shadow-md px-4 py-2 sm:px-6 sm:py-3">
      <div className="max-w-screen-xl mx-auto flex justify-between items-center gap-4">
        {/* Left Section - Profile Picture */}
        <button
          onClick={() => navigate("/profile")}
          className="flex items-center p-1 bg-white rounded-full shadow-sm hover:bg-gray-200 transition cursor-pointer sm:p-2"
        >
          <img
            src={authUser.profilePic || "/avatar.png"}
            alt="User"
            className="w-8 h-8 rounded-full object-cover sm:w-10 sm:h-10"
          />
        </button>

        {/* Middle Section - Responsive Layout */}
        <div className="flex-grow flex items-center justify-center">
          <div className="flex items-center gap-2 bg-white/50 px-3 py-1 rounded-full shadow-sm border border-gray-200 sm:gap-3 sm:px-6 sm:py-2">
            {/* School Name - Hidden on mobile */}
            <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent sm:text-2xl">
              GSHS
            </span>
            
            {/* Logo - Fixed aspect ratio with min-width to prevent squishing */}
            <div className="relative flex items-center justify-center px-1 sm:px-3">
              <div className="hidden sm:block absolute -left-3 w-px h-8 bg-gradient-to-b from-gray-300 to-transparent"></div>
              <div className="flex-shrink-0 w-10 h-10 sm:w-14 sm:h-14 flex items-center justify-center">
                <img
                  src="/gshs-logo.png"
                  alt="GSHS Logo"
                  className="w-full h-full object-contain transform transition duration-300 hover:scale-105"
                />
              </div>
              <div className="hidden sm:block absolute -right-3 w-px h-8 bg-gradient-to-b from-gray-300 to-transparent"></div>
            </div>
            
            {/* App Name - Responsive Text */}
            <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent sm:text-2xl">
              ACADBRIDGE
            </span>
          </div>
        </div>  

        {/* Right Section - Icons */}
        <div className="flex items-center gap-2 sm:gap-4">
          <button 
            onClick={() => navigate("/message")} 
            className="p-1 rounded-full bg-white shadow-sm hover:bg-gray-200 transition cursor-pointer sm:p-2"
          >
            <Mail className="w-5 h-5 text-gray-900 sm:w-7 sm:h-7" />
          </button>
          <button
            onClick={handleLogout}
            className="p-1 rounded-full bg-white shadow-sm hover:bg-gray-200 transition cursor-pointer sm:p-2"
          >
            <LogOut className="w-5 h-5 text-gray-900 sm:w-7 sm:h-7" />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;