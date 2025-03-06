import React from 'react';
import { useNavigate } from 'react-router-dom'; // or `useNavigate` in react-router v6

const ForbiddenPage = () => {
  const navigate = useNavigate(); // or useNavigate() in v6

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 text-center">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
        <h1 className="text-4xl font-bold text-red-600">403 Forbidden</h1>
        <p className="mt-4 text-xl text-gray-600">
          Oops! You are not authorized to access this page.
        </p>
        <button
          onClick={handleGoHome}
          className="mt-6 px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition duration-300"
        >
          Go Back to Home
        </button>
      </div>
    </div>
  );
};

export default ForbiddenPage;
