import React, { useState, useEffect } from "react";
import Pagination from "../pagination";
import { ChevronLeft, ChevronRight, List } from "lucide-react";
import generateInsights from "./generate-insights"; // Assuming this is a utility function that generates insights based on the chart data

const TeacherChartAnalysis = ({ chartData, dataType, selectedQuarter, chartType }) => {
  // Add state for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [isShowingAll, setIsShowingAll] = useState(false);
  const itemsPerPage = 3; // Number of trends to show per page
  
  // Reset pagination when chart data changes
  useEffect(() => {
    setCurrentPage(1);
    setIsShowingAll(false);
  }, [chartData, dataType, selectedQuarter]);
  
  if (!chartData || chartData.length === 0) return null;

  
  const insights = generateInsights(chartData, dataType, selectedQuarter, chartType);
  
  // Render insights based on the type
  const renderInsights = () => {
    if (!insights) return null;
    
    // Handle cases with no valid data
    if (insights.noValidData) {
      return (
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <h5 className="text-yellow-800 font-medium">No Valid Data Available</h5>
          <p className="text-yellow-700">{insights.message}</p>
          <p className="text-yellow-700 mt-2">Please check that your data contains valid numerical grades greater than zero.</p>
        </div>
      );
    }
    
    switch (insights.type) {
      case "quarterTrends":
        // Get total number of trends
        const totalTrends = insights.trends.length;
        
        // Get current page trends
        const currentTrends = isShowingAll 
          ? insights.trends 
          : insights.trends.slice(
              (currentPage - 1) * itemsPerPage,
              currentPage * itemsPerPage
            );
        
        return (
          <div>
            <h4 className="text-lg font-medium mb-2">Performance Trends</h4>
            <div className="space-y-4">
              {currentTrends.map(trend => (
                <div key={trend.student} className={`border-l-4 px-4 py-2 
                  ${trend.trend === "improving" ? 'border-green-500' :
                    trend.trend === "declining" ? 'border-red-500' : 'border-yellow-400'}`}>
                
                  <h5 className="font-medium mb-1">{trend.student}</h5>
                  {trend.trend === "insufficient" ? (
                    <p>Not enough data to determine a trend.</p>
                  ) : (
                    <>
                      <p>
                        <span className={`font-medium ${
                          trend.trend === "improving" ? "text-green-600" : 
                          trend.trend === "declining" ? "text-red-600" : "text-yellow-600"
                        }`}>
                          {trend.trend === "improving" ? "Improving" : 
                          trend.trend === "declining" ? "Declining" : "Stable"}
                        </span>{" "}
                        {trend.trend !== "stable" && `by ${Math.abs(trend.percentChange).toFixed(1)}%`}
                      </p>
                      <p className="text-sm text-gray-600">
                        Best performance in {trend.highestQuarter}
                        {trend.lowestQuarter !== "Same as highest" ? ` • Lowest in ${trend.lowestQuarter}` : " (all quarters equal)"}
                      </p>
                    </>
                  )}
                </div>
              ))}
            </div>
            
            {/* Add pagination component */}
            {totalTrends > itemsPerPage && (
              <Pagination
                totalItems={totalTrends}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                showAllOption={true}
                isShowingAll={isShowingAll}
                setIsShowingAll={setIsShowingAll}
              />
            )}
          </div>
        );
        
      case "sectionComparison":
        return (
          <div>
            <h4 className="text-lg font-medium mb-2">Section Comparison for {insights.quarter}</h4>
            {insights.invalidSections > 0 && (
              <p className="text-yellow-600 mb-3">
                Note: {insights.invalidSections} out of {insights.totalSections} sections have missing or invalid grade data.
              </p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h5 className="text-green-800 font-medium">Highest Performing</h5>
                <p className="text-2xl font-bold text-green-700">{insights.highestSection.name}</p>
                <p className="text-green-700">{insights.highestSection.grade.toFixed(1)}%</p>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h5 className="text-blue-800 font-medium">Class Average</h5>
                <p className="text-2xl font-bold text-blue-700">{insights.averageGrade}%</p>
                <p className="text-blue-700">{insights.sectionCount} valid sections</p>
              </div>
              
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <h5 className="text-red-800 font-medium">Lowest Performing</h5>
                <p className="text-2xl font-bold text-red-700">{insights.lowestSection.name}</p>
                <p className="text-red-700">{insights.lowestSection.grade.toFixed(1)}%</p>
              </div>
            </div>
          </div>
        );
        
      case "overallTrends":
        return (
          <div>
            <h4 className="text-lg font-medium mb-2">Overall Performance Analysis</h4>
            {insights.missingDataPoints > 0 && (
              <p className="text-yellow-600 mb-3">
                Note: {insights.missingDataPoints} data points are missing or invalid out of {insights.validDataPoints + insights.missingDataPoints} total.
              </p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {insights.mostImproved && (
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h5 className="text-green-800 font-medium">Most Improved</h5>
                  <p className="text-2xl font-bold text-green-700">{insights.mostImproved.section}</p>
                  <p className="text-green-700">
                    {insights.mostImproved.trend > 0 ? `+${insights.mostImproved.trend.toFixed(1)}` : insights.mostImproved.trend.toFixed(1)}% change
                  </p>
                </div>
              )}
              
              {insights.highestAverage && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h5 className="text-blue-800 font-medium">Highest Average</h5>
                  <p className="text-2xl font-bold text-blue-700">{insights.highestAverage.section}</p>
                  <p className="text-blue-700">{insights.highestAverage.average.toFixed(1)}% average</p>
                </div>
              )}
              
              <div className="col-span-1 md:col-span-2 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <h5 className="text-yellow-800 font-medium">Class Overview</h5>
                <p className="text-xl font-bold text-yellow-700">
                  {insights.overallAverage === "N/A" ? "Insufficient data for average" : `${insights.overallAverage}% overall average`}
                </p>
                <p className="text-yellow-700">
                  {insights.mostDeclined && insights.mostDeclined.trend < -5 ? 
                    `Note: ${insights.mostDeclined.section} shows a significant decrease of ${insights.mostDeclined.trend.toFixed(1)}%` : 
                    "All sections performing within normal ranges"}
                </p>
              </div>
            </div>
          </div>
        );
        
        case "quarterSnapshot":
          return insights.noValidData ? (
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-gray-600">{insights.message}</p>
            </div>
          ) : (
            <div>
              <h4 className="text-lg font-medium mb-2">Quarter {insights.quarter.substring(1)} Snapshot</h4>
              {insights.totalStudents - insights.validStudents > 0 && (
                <p className="text-yellow-600 mb-3">
                  Note: {insights.totalStudents - insights.validStudents} out of {insights.totalStudents} students have missing or invalid grade data.
                </p>
              )}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h5 className="text-blue-800 font-medium">Performance Summary</h5>
                  <p className="text-xl font-bold text-blue-700">{insights.averageGrade}% average</p>
                  
                  {insights.allSameGrade ? (
                    <div className="text-blue-700">
                      <p className="font-medium">All students have the same grade: {insights.maxGrade.toFixed(1)}%</p>
                      {insights.validStudents > 5 ? (
                        <p>({insights.validStudents} students with identical grades)</p>
                      ) : (
                        <ul className="list-disc pl-5">
                          {insights.highestStudents.map((student, index) => (
                            <li key={`student-${index}`}>{student.student}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ) : (
                    <>
                      <div className="text-blue-700">
                        <p className="font-medium">Highest: {insights.maxGrade.toFixed(1)}%</p>
                        <ul className="list-disc pl-5">
                          {insights.highestStudents.map((student, index) => (
                            <li key={`highest-${index}`}>{student.student}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="text-blue-700 mt-2">
                        <p className="font-medium">Lowest: {insights.minGrade.toFixed(1)}%</p>
                        <ul className="list-disc pl-5">
                          {insights.lowestStudents.map((student, index) => (
                            <li key={`lowest-${index}`}>{student.student}</li>
                          ))}
                        </ul>
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              {/* New statistics section */}
              <div className="mt-4 bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                <h5 className="text-indigo-800 font-medium mb-2">Detailed Statistics</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <p className="text-indigo-900 font-medium">Central Tendency</p>
                    <ul className="list-disc pl-5 text-indigo-700">
                      <li>Mean: {insights.averageGrade}%</li>
                      <li>Median: {insights.medianGrade}%</li>
                      <li>
                        Mode: {insights.modeGrade.values.map(v => `${v}%`).join(', ')}
                        {insights.modeGrade.values.length > 0 && 
                          ` (${insights.modeGrade.frequency} occurrences)`}
                      </li>
                    </ul>
                  </div>
                  <div>
                    <p className="text-indigo-900 font-medium">Range Analysis</p>
                    <ul className="list-disc pl-5 text-indigo-700">
                      <li>Minimum: {insights.minGrade.toFixed(1)}%</li>
                      <li>Maximum: {insights.maxGrade.toFixed(1)}%</li>
                      <li>Range: {insights.gradeRange}%{insights.allSameGrade && " (all grades identical)"}</li>
                    </ul>
                  </div>
                  <div>
                    <p className="text-indigo-900 font-medium">Distribution</p>
                    <ul className="list-disc pl-5 text-indigo-700">
                      <li>Standard Deviation: {insights.standardDeviation}{insights.allSameGrade && " (0)"}</li>
                      <li>Valid Samples: {insights.validStudents}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          );
      
      default:
        return null;
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow mt-5">
      <h3 className="text-xl font-semibold mb-4">Chart Analysis</h3>
      {renderInsights()}
      
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h4 className="text-lg font-medium mb-2">Recommended Actions</h4>
        {insights?.noValidData ? (
          <ul className="list-disc pl-5 space-y-2">
            <li>Check data entry for missing or invalid grades (zero, undefined, or null values).</li>
            <li>Ensure all grades are entered as valid numbers greater than zero.</li>
            <li>Confirm that the correct data format is being used for this chart type.</li>
          </ul>
        ) : insights?.type === "quarterTrends" && (
          <ul className="list-disc pl-5 space-y-2">
            <li>Focus on consistency in subjects showing fluctuating performance.</li>
            <li>Consider additional support for declining subjects before the next quarter.</li>
            <li>Document successful teaching strategies from improving subjects.</li>
          </ul>
        )}
        
        {insights?.type === "sectionComparison" && !insights?.noValidData && (
          <ul className="list-disc pl-5 space-y-2">
            <li>Consider peer learning between high and low performing sections.</li>
            <li>Review teaching methods used in the highest performing section.</li>
            <li>Schedule intervention for sections below 70% performance.</li>
            {insights.invalidSections > 0 && (
              <li>Complete data entry for the {insights.invalidSections} sections with missing grades.</li>
            )}
          </ul>
        )}
        
        {insights?.type === "overallTrends" && !insights?.noValidData && (
          <ul className="list-disc pl-5 space-y-2">
            <li>Implement strategies from the most improved section across other classes.</li>
            <li>Schedule a review of curriculum if overall average is below target.</li>
            <li>Provide additional resources to sections showing consistent decline.</li>
            {insights.missingDataPoints > 0 && (
              <li>Address data gaps to ensure more accurate trend analysis in the future.</li>
            )}
          </ul>
        )}
        
        {insights?.type === "quarterSnapshot" && !insights?.noValidData && (
          <ul className="list-disc pl-5 space-y-2">
            <li>Create targeted practice activities for the lowest performing subject.</li>
            <li>Consider additional assessments to identify specific areas of difficulty.</li>
            <li>Review the assessment difficulty if grades are significantly lower than expected.</li>
            {insights.totalSubjects - insights.validSubjects > 0 && (
              <li>Complete missing grade data for a more comprehensive analysis.</li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
};

export default TeacherChartAnalysis;