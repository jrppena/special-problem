import React from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PageHeader = ({ title }) => {
  const navigate = useNavigate();

  const onBack = () => {
    navigate(-1);
  };

  return (
    <div className="inline-flex items-center gap-5 bg-white/60 backdrop-blur-md rounded-2xl px-8 py-4 shadow-lg border border-gray-300 hover:shadow-xl transition-all w-auto animate-fade-in">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="p-2 rounded-full bg-gray-200/60 hover:bg-gray-300/80 transition-all shadow-sm hover:shadow-md"
      >
        <ArrowLeft className="w-6 h-6 text-gray-800" />
      </button>

      {/* Page Title */}
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-wide">
        {title}
      </h1>
    </div>
  );
};

export default PageHeader;
