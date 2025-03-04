import React, { useState } from "react";
import { CheckCircle, XCircle, Users } from "lucide-react"; // Icons
import Modal from "../components/modal"; // Modal Component

const ApprovalTable = ({ userType, users, onApprove, onDisapprove }) => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionType, setActionType] = useState(""); // "approve" or "disapprove"
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Define table columns dynamically (without Year Level)
  const columns = ["Name", "Email", "Action"];

  // Filter users based on selected userType
  const filteredUsers = users.filter((user) => {
    if (userType === "Student") return user.role === "Student";
    if (userType === "Teacher") return user.role === "Teacher";
    return true; // "All" shows all users
  });

  // Handle button click to open modal
  const handleAction = (user, action) => {
    setSelectedUser(user);
    setActionType(action);
    setIsModalOpen(true);
  };

  // Confirm action
  const confirmAction = () => {
    if (actionType === "approve") {
      onApprove(selectedUser);
    } else {
      onDisapprove(selectedUser);
    }
    setIsModalOpen(false); // Close modal after action
  };

  return (
    <div className="overflow-x-auto mt-6">
      {filteredUsers.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transform hover:scale-105 transition duration-300 ease-in-out flex flex-col items-center justify-center">
          <Users className="w-16 h-16 text-gray-400" />
          <h2 className="text-xl font-semibold text-gray-700 mt-3">
            No {userType === "All" ? "users" : userType === "Student" ? "students" : "teachers"} to verify
          </h2>
          <p className="text-gray-500">All accounts have been processed!</p>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transform  transition duration-300 ease-in-out">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((col, index) => (
                  <th
                    key={index}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user, index) => (
                <tr
                  key={index}
                  className={`hover:bg-blue-50 transition ${
                    index % 2 === 0 ? "bg-gray-50" : "bg-white"
                  }`}
                >
                  <td className="px-6 py-4 font-medium text-gray-800">
                    {user.firstName + " " + user.lastName}
                  </td>
                  <td className="px-6 py-4 text-blue-600 hover:underline cursor-pointer">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 flex items-center gap-3">
                    <button
                      className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition transform hover:scale-105 shadow-sm"
                      onClick={() => handleAction(user, "approve")}
                    >
                      <CheckCircle className="w-5 h-5" />
                      Approve
                    </button>
                    <button
                      className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition transform hover:scale-105 shadow-sm"
                      onClick={() => handleAction(user, "disapprove")}
                    >
                      <XCircle className="w-5 h-5" />
                      Disapprove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Component for Confirmation */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={confirmAction}
        actionType={actionType}
        user={selectedUser}
      />
    </div>
  );
};

export default ApprovalTable;
