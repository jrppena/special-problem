import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Info, AlertCircle, LineChart, BarChart, AreaChart } from 'lucide-react';

const ChartToolTip = ({ chartType, dataType, selectedQuarter }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [activeTab, setActiveTab] = useState('explanation'); // 'explanation' or 'guide'

  // Existing explanation logic
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

  // New interpretation guide logic
  const getInterpretationGuide = () => {
    const guides = {
      line: [
        "Look for the overall trend - is the line rising, falling, or fluctuating?",
        "Identify peaks and troughs in the line for significant performance changes",
        "Compare the slope between points to understand rate of change"
      ],
      area: [
        "Observe the overlapping areas to compare section performances",
        "Look for sections maintaining consistent performance (smooth areas)",
        "Notice sections with large fluctuations (jagged areas)"
      ],
      bar: [
        "Compare bar heights for quick performance comparison",
        "Look for unusually tall or short bars indicating outliers",
        "Compare adjacent bars for quarter-to-quarter changes"
      ]
    };

    return guides[chartType] || [
      "Focus on key data points and outliers",
      "Look for patterns and trends in the data visualization",
      "Compare different segments or groups visually"
    ];
  };

  const ChartIcon = {
    line: LineChart,
    area: AreaChart,
    bar: BarChart
  }[chartType] || AlertCircle;

  return (
    <div className="text-sm text-gray-700 bg-blue-50 rounded-lg p-3 mt-2 border border-blue-100">
      <div 
        className="flex items-center cursor-pointer"
        onClick={() => setIsVisible(!isVisible)}
      >
        <Info size={18} className="mr-2 text-blue-600" />
        <span className="font-medium text-blue-800 mr-2">Chart Guidance</span>
        {isVisible ? (
          <ChevronUp size={18} className="text-blue-600" />
        ) : (
          <ChevronDown size={18} className="text-blue-600" />
        )}
      </div>

      {isVisible && (
        <div className="mt-3">
          <div className="flex gap-2 mb-3 border-b border-blue-100">
            <button
              className={`pb-1 px-2 ${
                activeTab === 'explanation' 
                ? 'border-b-2 border-blue-600 text-blue-800' 
                : 'text-blue-600 hover:text-blue-800'
              }`}
              onClick={() => setActiveTab('explanation')}
            >
              Why this chart?
            </button>
            <button
              className={`pb-1 px-2 ${
                activeTab === 'guide' 
                ? 'border-b-2 border-blue-600 text-blue-800' 
                : 'text-blue-600 hover:text-blue-800'
              }`}
              onClick={() => setActiveTab('guide')}
            >
              How to read
            </button>
          </div>

          {activeTab === 'explanation' ? (
            <div className="flex items-start gap-3">
              <ChartIcon size={20} className="mt-1 text-blue-600 flex-shrink-0" />
              <div>
                <p className="text-blue-900">{getExplanation()}</p>
                <p className="mt-2 text-xs text-blue-500 bg-blue-100 px-2 py-1 rounded">
                  Currently viewing: {chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <h4 className="text-blue-800 font-medium flex items-center gap-2">
                <LineChart size={18} className="text-blue-600" />
                Key Interpretation Tips:
              </h4>
              <ul className="space-y-2 pl-5">
                {getInterpretationGuide().map((tip, index) => (
                  <li 
                    key={index}
                    className="relative text-blue-900 before:content-[''] before:block before:absolute before:-left-3 before:top-2 before:w-1.5 before:h-1.5 before:rounded-full before:bg-blue-400"
                  >
                    {tip}
                  </li>
                ))}
              </ul>
              <p className="text-xs text-blue-500 mt-2 italic">
                Tip: Hover over chart elements for detailed values
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChartToolTip;