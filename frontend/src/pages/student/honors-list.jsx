import React from "react";

const HonorsList = ({ grades, selectedQuarter }) => {
  // Calculate final average based on quarter averages
  const calculateFinalAverage = (quarterAverages) => {
    const quarters = ["Q1", "Q2", "Q3", "Q4"];
    const validAverages = quarters
      .map(q => parseFloat(quarterAverages[q]))
      .filter(q => !isNaN(q));
    
    if (validAverages.length === 0) return { average: 'N/A', isComplete: false };
    
    const total = validAverages.reduce((sum, q) => sum + q, 0);
    return { 
      average: (total / validAverages.length).toFixed(2),
      isComplete: validAverages.length === 4 // All quarters complete
    };
  };

  // Check if all required classes have grades for a specific quarter
  const hasCompleteQuarterGrades = (quarter) => {
    // If there are no classes, return false
    if (!grades || grades.length === 0) return false;
    
    // Check if all classes have grades for this quarter
    return grades.every(cls => 
      cls.grades && 
      cls.grades[quarter] !== undefined && 
      cls.grades[quarter] !== null &&
      cls.grades[quarter] !== "-" &&
      !isNaN(parseFloat(cls.grades[quarter]))
    );
  };

  // Determine honor status based on average
  const getHonorStatus = (average) => {
    if (average >= 98) return { status: "With Highest Honors", color: "bg-blue-100 text-blue-800" };
    else if (average >= 95) return { status: "With High Honors", color: "bg-green-100 text-green-800" };
    else if (average >= 90) return { status: "With Honors", color: "bg-yellow-100 text-yellow-800" };
    return { status: null, color: "" };
  };

  // Get quarter display name
  const getQuarterDisplay = () => {
    if (selectedQuarter === "all") return "Overall";
    if (selectedQuarter === "Q1") return "First Quarter";
    if (selectedQuarter === "Q2") return "Second Quarter";
    if (selectedQuarter === "Q3") return "Third Quarter";
    if (selectedQuarter === "Q4") return "Fourth Quarter";
    return selectedQuarter;
  };

  // Get overall honor status and average
  const getHonorAndAverage = () => {
    if (selectedQuarter === "all") {
      // Calculate average from all available quarters
      const quarterAverages = {};
      
      ["Q1", "Q2", "Q3", "Q4"].forEach(quarter => {
        // Calculate average for this quarter
        const validGrades = grades
          .map(classGrade => {
            const grade = classGrade.grades[quarter];
            return grade === "-" ? null : parseFloat(grade);
          })
          .filter(grade => grade !== null && !isNaN(grade));
        
        if (validGrades.length > 0) {
          const average = validGrades.reduce((sum, grade) => sum + grade, 0) / validGrades.length;
          quarterAverages[quarter] = average;
        } else {
          quarterAverages[quarter] = NaN;
        }
      });
      
      // Calculate final average from quarter averages
      const { average, isComplete } = calculateFinalAverage(quarterAverages);
      
      if (average === 'N/A') return { honor: null, average: null, isComplete: false };
      
      const numericAverage = parseFloat(average);
      const { status, color } = getHonorStatus(numericAverage);
      
      return { 
        honor: status, 
        average: numericAverage, 
        color, 
        isComplete
      };
    } else {
      // For specific quarter
      const validGrades = grades
        .map(classGrade => {
          const grade = classGrade.grades[selectedQuarter];
          return grade === "-" ? null : parseFloat(grade);
        })
        .filter(grade => grade !== null && !isNaN(grade));
      
      if (validGrades.length === 0) {
        return { honor: null, average: null, isComplete: false };
      }
      
      const average = validGrades.reduce((sum, grade) => sum + grade, 0) / validGrades.length;
      const isComplete = hasCompleteQuarterGrades(selectedQuarter);
      const { status, color } = getHonorStatus(average);
      
      return { 
        honor: status, 
        average, 
        color, 
        isComplete
      };
    }
  };

  const { honor, average, color, isComplete } = getHonorAndAverage();
  const quarterDisplay = getQuarterDisplay();

  if (!honor) {
    return (
      <div className="mt-6 bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-4">
          Honors Status <span className="text-gray-500 text-lg font-normal">- {quarterDisplay}</span>
        </h3>
        <div className="text-gray-500 text-center p-4">
          No honors qualification for the selected period
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 bg-white p-6 rounded-lg shadow">
      <h3 className="text-xl font-semibold mb-4">
        Honors Status <span className="text-gray-500 text-lg font-normal">- {quarterDisplay}</span>
      </h3>
      <div className="flex flex-col md:flex-row items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center mb-4 md:mb-0">
          <div className={`px-4 py-2 rounded-full ${color} font-medium`}>
            {honor}
          </div>
          {!isComplete && (
            <span className="ml-2 px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
              Incomplete Grades
            </span>
          )}
        </div>
        <div className="text-center">
          <span className="text-gray-500 mr-2">Average:</span>
          <span className="font-semibold text-lg">{average.toFixed(2)}</span>
        </div>
      </div>
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium mb-2">Honor Levels:</h4>
        <ul className="space-y-2">
          <li className="flex items-center">
            <span className="w-4 h-4 rounded-full bg-blue-100 mr-2"></span>
            <span>With Highest Honors: 98.00 and above</span>
          </li>
          <li className="flex items-center">
            <span className="w-4 h-4 rounded-full bg-green-100 mr-2"></span>
            <span>With High Honors: 95.00 - 97.99</span>
          </li>
          <li className="flex items-center">
            <span className="w-4 h-4 rounded-full bg-yellow-100 mr-2"></span>
            <span>With Honors: 90.00 - 94.99</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default HonorsList;