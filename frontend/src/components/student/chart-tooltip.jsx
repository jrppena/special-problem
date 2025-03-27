import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Info, LineChart, BarChart, AreaChart, Radar, BookOpen } from 'lucide-react';

const ChartToolTip = ({ chartType, dataType, selectedQuarter }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [activeTab, setActiveTab] = useState('explanation');

  // Existing explanation logic
  const getExplanation = () => {
    if (dataType === "singleSubjectAcrossQuarters") {
      if (chartType === "line") {
        return "Line chart shows your progress in a single subject over time, helping you track improvement patterns and identify which quarters need more attention.";
      } else if (chartType === "area") {
        return "Area chart emphasizes your cumulative progress in a subject, making it easy to see overall performance trends across quarters.";
      }
    } else if (dataType === "subjectsAcrossQuarters") {
      if (chartType === "line") {
        return "Line chart compares your performance across multiple subjects over time, highlighting subjects that are consistently strong or need improvement.";
      } else if (chartType === "area") {
        return "Area chart shows how different subjects compare over time, helping identify subjects that might be affecting your overall performance.";
      } else if (chartType === "radar") {
        return "Radar chart gives a snapshot of all subjects across quarters, revealing which subjects contribute most to your academic profile.";
      }
    } else if (dataType === "subjectsInOneQuarter") {
      if (chartType === "bar") {
        return "Bar chart clearly shows your strongest and weakest subjects in a specific quarter, helping focus your study efforts.";
      } else if (chartType === "radar") {
        return "Radar chart displays your all-around performance in a single quarter, showing which subjects are boosting or dragging your overall results.";
      }
    }
    return "This visualization was automatically chosen to best represent your academic performance data.";
  };

  // New student-focused interpretation guide
  const getStudyTips = () => {
    const tips = {
      line: [
        "Follow the line's direction - upward trends show improvement",
        "Look for sudden drops/spikes that might indicate specific events",
        "Compare slope angles to understand learning pace changes"
      ],
      area: [
        "Notice where colors stack up - indicates consistent performance areas",
        "Watch for shrinking/expanding areas showing subject focus changes",
        "Look for steep inclines/declines in the top edges"
      ],
      bar: [
        "Compare bar heights to quickly identify strong/weak subjects",
        "Look for unusually short bars that need attention",
        "Notice patterns in similar-height bars for related subjects"
      ],
      radar: [
        "Look for symmetrical shapes - indicates balanced performance",
        "Identify 'spikes' showing strong subjects",
        "Notice 'valleys' indicating areas needing improvement",
        "Compare web coverage area for overall performance assessment"
      ]
    };

    return tips[chartType] || [
      "Focus on outlier values that stand out",
      "Look for consistent patterns across the visualization",
      "Compare different segments for relative performance"
    ];
  };

  const ChartIcon = {
    line: LineChart,
    area: AreaChart,
    bar: BarChart,
    radar: Radar
  }[chartType] || BookOpen;

  return (
    <div className="text-sm text-gray-700 bg-indigo-50 rounded-lg p-3 mt-2 border border-indigo-100">
      <div 
        className="flex items-center cursor-pointer"
        onClick={() => setIsVisible(!isVisible)}
      >
        <Info size={18} className="mr-2 text-indigo-600" />
        <span className="font-medium text-indigo-800 mr-2">Study Performance Guide</span>
        {isVisible ? (
          <ChevronUp size={18} className="text-indigo-600 ml-auto" />
        ) : (
          <ChevronDown size={18} className="text-indigo-600 ml-auto" />
        )}
      </div>

      {isVisible && (
        <div className="mt-3">
          <div className="flex gap-2 mb-3 border-b border-indigo-100">
            <button
              className={`pb-1 px-2 ${
                activeTab === 'explanation' 
                ? 'border-b-2 border-indigo-600 text-indigo-800' 
                : 'text-indigo-600 hover:text-indigo-800'
              }`}
              onClick={() => setActiveTab('explanation')}
            >
              Chart Purpose
            </button>
            <button
              className={`pb-1 px-2 ${
                activeTab === 'guide' 
                ? 'border-b-2 border-indigo-600 text-indigo-800' 
                : 'text-indigo-600 hover:text-indigo-800'
              }`}
              onClick={() => setActiveTab('guide')}
            >
              Study Tips
            </button>
          </div>

          {activeTab === 'explanation' ? (
            <div className="flex items-start gap-3">
              <ChartIcon size={20} className="mt-1 text-indigo-600 flex-shrink-0" />
              <div>
                <p className="text-indigo-900">{getExplanation()}</p>
                <p className="mt-2 text-xs text-indigo-500 bg-indigo-100 px-2 py-1 rounded">
                  Current view: {chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <h4 className="text-indigo-800 font-medium flex items-center gap-2">
                <BookOpen size={18} className="text-indigo-600" />
                Actionable Insights:
              </h4>
              <ul className="space-y-2 pl-5">
                {getStudyTips().map((tip, index) => (
                  <li 
                    key={index}
                    className="relative text-indigo-900 before:content-[''] before:block before:absolute before:-left-3 before:top-2 before:w-1.5 before:h-1.5 before:rounded-full before:bg-indigo-400"
                  >
                    {tip}
                  </li>
                ))}
              </ul>
              <p className="text-xs text-indigo-500 mt-2 italic">
                Pro Tip: Click on chart elements to see detailed grade information
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChartToolTip;