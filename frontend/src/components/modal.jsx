import React from "react";
import { AlertCircle } from "lucide-react";

const Modal = ({ isOpen, onClose, onConfirm, actionType, user }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center backdrop-blur-md bg-gray-500/20">
      <div className="bg-white rounded-lg shadow-xl p-6 w-96">
        <div className="flex flex-col items-center">
          <AlertCircle className="w-10 h-10 text-yellow-500 mb-3" />
          <h2 className="text-xl font-bold text-gray-900">
            Confirm {actionType === "approve" ? "Approval" : "Disapproval"}
          </h2>
          <p className="text-gray-600 text-center mt-2">
            Are you sure you want to {actionType} <strong>{user.firstName + " " + user.lastName}</strong>?
          </p>
        </div>

        {/* Buttons */}
        <div className="flex justify-between mt-6">
          <button
            className="px-4 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500 transition"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className={`px-4 py-2 text-white rounded-md ${
              actionType === "approve" ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"
            } transition`}
            onClick={onConfirm}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
