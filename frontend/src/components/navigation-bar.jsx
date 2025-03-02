import React from "react";
import { Mail, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom"; // For navigation
import { useAuthStore } from "../store/useAuthStore";

const Navbar = () => {
  const navigate = useNavigate(); // Hook for page navigation
  const { logout } = useAuthStore();
  
  const handleLogout = () => {
    logout();
  }

  return (
    <nav className="bg-gray-100 border-b border-gray-300 shadow-md px-6 py-3">
      <div className="max-w-screen-xl mx-auto flex justify-between items-center">
        
        {/* Left Section - Profile Picture (Clickable) */}
        <button
          onClick={() => navigate("/profile")}
          className="flex items-center gap-2 p-2 bg-white rounded-full shadow-sm hover:bg-gray-200 transition cursor-pointer"
        >
          <img
            src="/docs/images/people/profile-picture-3.jpg"
            alt="User"
            className="w-10 h-10 rounded-full"
          />
        </button>

        {/* Middle Section - App Name */}
        <h1 className="text-2xl font-bold text-gray-900 tracking-wide">ACADBRIDGE</h1>

        {/* Right Section - Icons */}
        <div className="flex items-center gap-4">
          <button className="p-2 rounded-full bg-white shadow-sm hover:bg-gray-200 transition cursor-pointer">
            <Mail className="w-7 h-7 text-gray-900" />
          </button>
          <button
            onClick={handleLogout}
            className="p-2 rounded-full bg-white shadow-sm hover:bg-gray-200 transition cursor-pointer"
          >
            <LogOut className="w-7 h-7 text-gray-900" />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
