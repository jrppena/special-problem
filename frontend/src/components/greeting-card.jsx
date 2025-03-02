import React from "react";

const GreetingCard = ({ name }) => {
  return (
    <div className="w-full  mx-auto mt-10 px-10">
      <div className="w-full bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500 flex items-center gap-4">
        <span className="text-blue-500 text-4xl">👋</span>
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Hello, {name}</h2>
          <p className="text-xl text-gray-700 mt-1">
            What do you want to do today?
          </p>
        </div>
      </div>
    </div>
  );
};

export default GreetingCard;
