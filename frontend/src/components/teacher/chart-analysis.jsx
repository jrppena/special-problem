import React, { useState, useEffect } from "react";
import Pagination from "../../components/pagination";
import { ChevronLeft, ChevronRight, List } from "lucide-react";

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

  // Extract insights from the data
  const generateInsights = () => {
    // For single section performance across all quarters
    if (dataType === "singleSectionPerformance" && selectedQuarter === "all") {
      const students = Object.keys(chartData[0]).filter(key => key !== "name");
      
      // Calculate trend for each student
      const trends = students.map(student => {
        const values = chartData.map(item => parseFloat(item[student]) || 0);
        const validValues = values.filter(val => val > 0);
        
        if (validValues.length < 2) return { student, trend: "insufficient" };
        
        const firstVal = validValues[0];
        const lastVal = validValues[validValues.length - 1];
        const diff = lastVal - firstVal;
        const percentChange = (diff / firstVal) * 100;
        
        let trend;
        if (percentChange > 5) trend = "improving";
        else if (percentChange < -5) trend = "declining";
        else trend = "stable";
        
        
        return { 
          student, 
          trend, 
          percentChange, 
          highestQuarter: chartData[values.indexOf(Math.max(...values))].name,
          lowestQuarter: chartData[values.indexOf(Math.min(...validValues))].name
        };
      });
      
      return {
        type: "quarterTrends",
        trends
      };
    }
    
    // For all sections in a single quarter
    else if (dataType === "sectionsPerformance" && selectedQuarter !== "all") {
      // Find highest and lowest performing sections
      const sections = chartData.map(item => ({
        name: item.name,
        grade: parseFloat(item.Grade) || 0
      }));
      
      // Filter out sections with invalid grades (undefined, null, 0)
      const validSections = sections.filter(section => section.grade > 0);
      
      // If no valid sections, return a special case
      if (validSections.length === 0) {
        return {
          type: "sectionComparison",
          quarter: selectedQuarter,
          noValidData: true,
          message: "No valid grade data available for this quarter."
        };
      }
      
      // Sort sections by grade (highest to lowest)
      validSections.sort((a, b) => b.grade - a.grade);
      
      const highestSection = validSections[0];
      const lowestSection = validSections[validSections.length - 1];
      const averageGrade = validSections.reduce((sum, section) => sum + section.grade, 0) / validSections.length;
      
      return {
        type: "sectionComparison",
        quarter: selectedQuarter,
        highestSection,
        lowestSection,
        averageGrade: averageGrade.toFixed(2),
        sectionCount: validSections.length,
        totalSections: sections.length,
        invalidSections: sections.length - validSections.length
      };
    }
    
    // For all sections across all quarters
    else if (dataType === "sectionsPerformance" && selectedQuarter === "all") {
      // Get all section names
      const sectionNames = chartData.map(item => item.name);

      // Get quarter columns (excluding name and Average)
      const quarters = Object.keys(chartData[0]).filter(key => 
        key !== "name" && key !== "Average" && key.startsWith("Q")
      );

      // Find the most improved and most declined sections
      const sectionTrends = sectionNames.map(section => {
        const sectionData = chartData.find(item => item.name === section);
        
        // Map quarter values for the section
        const quarterValues = quarters.map(q => parseFloat(sectionData[q]) || 0);
        
        // Filter out invalid quarter values
        const validValues = quarterValues.filter(val => val > 0);
        
        // Ensure we have at least two valid values to calculate a trend
        if (validValues.length < 2) {
          return { section, trend: 0, hasValidTrend: false };
        }

        // Calculate the trend as the difference between the first and last valid value
        const firstVal = validValues[0];
        const lastVal = validValues[validValues.length - 1];
        const trend = lastVal - firstVal;
        
        // Calculate average across quarters (since we might not have an Average field)
        const avgValue = validValues.reduce((sum, val) => sum + val, 0) / validValues.length;
        
        return {
          section,
          trend,
          hasValidTrend: true,
          average: avgValue // Calculate average from quarter values instead of using Average field
        };
      });

      // Filter and sort sections with valid trends
      const sectionsWithValidTrends = sectionTrends.filter(s => s.hasValidTrend);
      sectionsWithValidTrends.sort((a, b) => b.trend - a.trend);

      // Get sections with valid averages (now we calculated these ourselves)
      const sectionsWithValidAverage = sectionTrends.filter(s => s.average > 0);
      sectionsWithValidAverage.sort((a, b) => b.average - a.average);

      // Check if we have enough valid data - use AND instead of OR to be more lenient
      if (sectionsWithValidTrends.length === 0 && sectionsWithValidAverage.length === 0) {
        return {
          type: " ",
          noValidData: true,
          message: "Insufficient valid grade data to analyze trends."
        };
      }

      // Find overall trend for all sections
      const allGrades = [];
      quarters.forEach(quarter => {
        chartData.forEach(section => {
          const grade = parseFloat(section[quarter]) || 0;
          if (grade > 0) allGrades.push(grade);
        });
      });

      const overallAverage = allGrades.length > 0 
        ? allGrades.reduce((sum, grade) => sum + grade, 0) / allGrades.length 
        : 0;

      return {
        type: "overallTrends",
        mostImproved: sectionsWithValidTrends.length > 0 ? sectionsWithValidTrends[0] : null,
        mostDeclined: sectionsWithValidTrends.length > 0 ? sectionsWithValidTrends[sectionsWithValidTrends.length - 1] : null,
        highestAverage: sectionsWithValidAverage.length > 0 ? sectionsWithValidAverage[0] : null,
        overallAverage: allGrades.length > 0 ? overallAverage.toFixed(2) : "N/A",
        validDataPoints: allGrades.length,
        missingDataPoints: (quarters.length * chartData.length) - allGrades.length
      };
    }
    
    // Single section in a specific quarter (less data to analyze)
    else {
      // Extract the subjects (excluding "name")
      const subjects = Object.keys(chartData[0]).filter(key => key !== "name");

      // Create an array of all grades for each subject across all students
      const grades = chartData.map(student => {
        return subjects.map(subject => ({
          subject,
          grade: parseFloat(student[subject]) || 0
        }));
      }).flat(); // Flatten the array to make it a single array of grade objects

      // Filter out subjects with invalid grades
      const validGrades = grades.filter(item => item.grade > 0);

      // If no valid grades, return a special case
      if (validGrades.length === 0) {
        return {
          type: "quarterSnapshot",
          quarter: selectedQuarter,
          noValidData: true,
          message: "No valid grade data available for this quarter snapshot."
        };
      }

      // Sort grades from highest to lowest
      validGrades.sort((a, b) => b.grade - a.grade);

      // Calculate and return the quarter snapshot data
      return {
        type: "quarterSnapshot",
        quarter: selectedQuarter,
        highestSubject: validGrades[0],
        lowestSubject: validGrades[validGrades.length - 1],
        averageGrade: (validGrades.reduce((sum, item) => sum + item.grade, 0) / validGrades.length).toFixed(2),
        validSubjects: validGrades.length,
        totalSubjects: grades.length
      };
    }
  };
  
  const insights = generateInsights();
  
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
                        Best performance in {trend.highestQuarter} • 
                        Lowest in {trend.lowestQuarter}
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
                <h5 className="text-red-800 font-medium">Needs Improvement</h5>
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
        return (
          <div>
            <h4 className="text-lg font-medium mb-2">Quarter {insights.quarter.substring(1)} Snapshot</h4>
            {insights.totalSubjects - insights.validSubjects > 0 && (
              <p className="text-yellow-600 mb-3">
                Note: {insights.totalSubjects - insights.validSubjects} out of {insights.totalSubjects} subjects have missing or invalid grade data.
              </p>
            )}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h5 className="text-blue-800 font-medium">Performance Summary</h5>
                <p className="text-xl font-bold text-blue-700">{insights.averageGrade}% average</p>
                <p className="text-blue-700">
                  Strongest: {insights.highestSubject.subject} ({insights.highestSubject.grade.toFixed(1)}%)
                </p>
                <p className="text-blue-700">
                  Needs focus: {insights.lowestSubject.subject} ({insights.lowestSubject.grade.toFixed(1)}%)
                </p>
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