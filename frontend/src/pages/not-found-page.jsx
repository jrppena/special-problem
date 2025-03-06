import React from "react";
import { useNavigate } from "react-router-dom"; // For navigating to homepage

const NotFoundPage = () => {

    const navigate = useNavigate();

    const handleGoHome = () => {
        navigate("/"); // Navigate to the homepage
    }

    return (
        <section className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="max-w-lg mx-auto p-8 bg-white rounded-lg shadow-lg text-center">
                <h1 className="text-8xl font-extrabold text-indigo-600 mb-6">
                    404
                </h1>
                <p className="text-4xl font-bold text-gray-800 mb-4">
                    Oops, something's missing.
                </p>
                <p className="text-lg text-gray-600 mb-8">
                    We can't seem to find the page you're looking for. But don't worry, you can return to the homepage and continue exploring.
                </p>
                <button
                    onClick={handleGoHome}
                    className="bg-indigo-600 text-white px-6 py-3 rounded-lg text-lg font-medium transition-transform transform hover:scale-105 hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300"
                >
                    Go Back to Homepage
                </button>
            </div>
        </section>
    );
}

export default NotFoundPage;
