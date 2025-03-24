import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Info } from 'lucide-react';

const ChartToolTip = ({ chartType, dataType, selectedQuarter }) => {
  const [isVisible, setIsVisible] = useState(true);

  // Get explanation based on chart type and data
  const getExplanation = () => {
    if (dataType === "singleSectionPerformance" && selectedQuarter === "all") {
      return "Line chart is best for showing performance trends over time for a single section.";
    } else if (dataType === "sectionsPerformance" && selectedQuarter === "all") {
      return "Area chart helps compare multiple sections' performance trends across all quarters.";
    } else if (dataType === "sectionsPerformance" && selectedQuarter !== "all") {
      return "Bar chart is ideal for comparing different sections' performance in a specific quarter.";
    } else if (dataType === "singleSectionPerformance" && selectedQuarter !== "all") {
      return "Bar chart works well for showing grade distribution for a single section in a specific quarter.";
    }
    return "Chart type automatically selected based on your data selection.";
  };

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  return (
    <div className="text-sm text-gray-600 bg-gray-50 rounded-md p-2 mt-2">
      <div 
        className="flex items-center cursor-pointer" 
        onClick={toggleVisibility}
      >
        <Info size={16} className="mr-2 text-blue-500" />
        <span className="font-medium mr-2">Chart Selection Info</span>
        {isVisible ? (
          <ChevronUp size={16} className="text-gray-500" />
        ) : (
          <ChevronDown size={16} className="text-gray-500" />
        )}
      </div>
      
      {isVisible && (
        <div className="mt-2 pl-6">
          <p>{getExplanation()}</p>
          <p className="mt-1 text-xs text-gray-500">
            {`Currently using: ${chartType === 'line' ? 'Line chart' : 
               chartType === 'area' ? 'Area chart' : 
               chartType === 'bar' ? 'Bar chart' : 'Custom chart'}`}
          </p>
        </div>
      )}
    </div>
  );
};

export default ChartToolTip;