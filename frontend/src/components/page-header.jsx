import React from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PageHeader = ({ title }) => {
  const navigate = useNavigate();

  const onBack = () => {
    navigate(-1); // ✅ Navigate back instead of hardcoding "/"
  };

  return (
    <div className="inline-flex items-center gap-4 bg-gray-100 rounded-xl px-6 py-3 shadow-md border border-gray-300 hover:shadow-lg transition-all w-auto">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="p-2 rounded-full hover:bg-gray-300/70 transition-all"
      >
        <ArrowLeft className="w-6 h-6 text-gray-800" />
      </button>

      {/* Page Title */}
      <h1 className="text-xl md:text-2xl font-bold text-gray-900 tracking-wide">
        {title}
      </h1>
    </div>
  );
};

export default PageHeader;
