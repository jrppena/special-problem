import React from "react";
import { LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { useAuthStore } from "../store/useAuthStore";

const VerificationPage = () => {
  const { logout } = useAuthStore();

  const handleLogout = () => {
    logout();
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-b from-gray-50 to-gray-200 text-center px-6">
      {/* Animated Hourglass */}
      <motion.div
      animate={{ rotate: [0, 10, -10, 0] }} // Subtle swing animation
      transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
      className="mb-8"
      >
      <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="black"
      className="w-20 h-20 text-gray-800"
      >
      <path d="M6 2h12v2h-1v4a4 4 0 0 1-1.45 3.08l-1.64 1.31 1.64 1.31A4 4 0 0 1 17 17v4h1v2H6v-2h1v-4a4 4 0 0 1 1.45-3.08l1.64-1.31-1.64-1.31A4 4 0 0 1 7 8V4H6V2zm9 2H9v4a2 2 0 0 0 .73 1.54l2.27 1.8 2.27-1.8A2 2 0 0 0 15 8V4zm0 16v-4a2 2 0 0 0-.73-1.54L12 12.66l-2.27 1.8A2 2 0 0 0 9 16v4h6z" />
      </svg>
      </motion.div>

      {/* Verification Message */}
      <h1 className="text-2xl font-semibold text-gray-900">Verification in Progress</h1>
      <p className="text-gray-600 text-lg max-w-md mt-2">
      Your account is being reviewed. You’ll be notified once it’s verified.
      </p>

      {/* Logout Button */}
      <button onClick={handleLogout} className="mt-8 px-6 py-3 text-gray-800 border border-gray-700 rounded-lg flex items-center gap-2 hover:bg-gray-800 hover:text-white transition-all">
      <LogOut size={20} />
      Logout
      </button>
    </div>
    );
  };

export default VerificationPage;
