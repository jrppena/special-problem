import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Info } from 'lucide-react';

const ChartToolTip = ({ chartType, dataType, selectedQuarter }) => {
  const [isVisible, setIsVisible] = useState(true);

  // Get explanation based on chart type and data
  const getExplanation = () => {
    if (dataType === "singleSubjectAcrossQuarters") {
      if (chartType === "line") {
        return "Line chart is ideal for showing how a subject's grades change over time across quarters, making it easy to spot trends and progress patterns.";
      } else if (chartType === "area") {
        return "Area chart helps visualize the subject's grade progression while emphasizing the magnitude of changes between quarters.";
      }
    } else if (dataType === "subjectsAcrossQuarters") {
      if (chartType === "line") {
        return "Line chart allows for clear comparison of multiple subjects' performance trends across all quarters, making it easy to spot which subjects are improving or declining.";
      } else if (chartType === "area") {
        return "Area chart helps compare multiple subjects while emphasizing the relative performance differences between subjects across quarters.";
      } else if (chartType === "radar") {
        return "Radar chart provides a unique way to visualize performance across multiple subjects and quarters simultaneously, making strengths and weaknesses immediately apparent.";
      }
    } else if (dataType === "subjectsInOneQuarter") {
      if (chartType === "bar") {
        return "Bar chart is ideal for comparing different subjects' performance in a specific quarter, making it easy to identify strongest and weakest subjects.";
      } else if (chartType === "radar") {
        return "Radar chart provides a comprehensive view of all subject performances in the selected quarter, highlighting the overall balance of academic strengths and weaknesses.";
      }
    }
    return "Chart type automatically selected based on your data selection to provide the most insightful visualization.";
  };

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  return (
    <div className="text-sm text-gray-600 bg-gray-50 rounded-md p-3 mt-2 border border-gray-200">
      <div 
        className="flex items-center cursor-pointer" 
        onClick={toggleVisibility}
      >
        <Info size={16} className="mr-2 text-blue-500" />
        <span className="font-medium mr-2">Why this chart type?</span>
        {isVisible ? (
          <ChevronUp size={16} className="text-gray-500 ml-auto" />
        ) : (
          <ChevronDown size={16} className="text-gray-500 ml-auto" />
        )}
      </div>
      
      {isVisible && (
        <div className="mt-2 pl-6">
          <p>{getExplanation()}</p>
          <p className="mt-2 text-xs text-gray-500">
            Currently using: <span className="font-medium">{
              chartType === 'line' ? 'Line chart' : 
              chartType === 'area' ? 'Area chart' : 
              chartType === 'bar' ? 'Bar chart' : 
              chartType === 'radar' ? 'Radar chart' : 'Custom chart'
            }</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default ChartToolTip;