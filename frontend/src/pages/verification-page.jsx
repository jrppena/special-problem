import React from "react";
import { LogOut, AlertCircle } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";

const VerificationPage = () => {
  const { authUser, logout } = useAuthStore();
  
  const handleLogout = () => {
    logout();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
      {authUser.accountStatus === "Rejected" ? (
        // Rejection State
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <div className="mb-6 flex justify-center">
            <AlertCircle size={64} className="text-red-500" />
          </div>
          
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Verification Rejected
          </h1>
          
          <p className="text-gray-700 mb-8">
            Unfortunately, your account verification was not approved. Please contact our support team for more information.
          </p>
          
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 bg-gray-800 text-white px-6 py-3 rounded-md hover:bg-gray-900 w-full"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      ) : (
        // Pending Verification State
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <div className="mb-6">
            <div className="animate-pulse relative h-16 w-16 mx-auto">
              <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
              <div className="absolute inset-2 border-4 border-blue-500 rounded-full"></div>
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-blue-600 mb-4">
            Verification in Progress
          </h1>
          
          <p className="text-gray-700 mb-8">
            Your account is being reviewed. You'll be notified once it's verified.
          </p>
          
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 bg-gray-800 text-white px-6 py-3 rounded-md hover:bg-gray-900 w-full"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default VerificationPage;