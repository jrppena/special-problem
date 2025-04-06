// Main function that delegates to specialized insight generators
const generateInsights = (chartData, dataType, selectedQuarter, chartType) => {
    if (dataType === "singleSectionPerformance" && selectedQuarter === "all") {
      return generateQuarterTrends(chartData);
    } else if (dataType === "sectionsPerformance" && selectedQuarter !== "all") {
      return generateSectionComparison(chartData, selectedQuarter);
    } else if (dataType === "sectionsPerformance" && selectedQuarter === "all") {
      return generateOverallTrends(chartData);
    } else {
      return generateQuarterSnapshot(chartData, selectedQuarter);
    }
  };
  
  // Calculate trends for single section performance across all quarters
  const generateQuarterTrends = (chartData) => {
    const students = Object.keys(chartData[0]).filter(key => key !== "name");
    
    const trends = students.map(student => {
      // Extract values for this student
      const values = chartData.map(item => parseFloat(item[student]) || 0);
      
      // Get quarters with valid data (value > 0)
      const validQuarterIndices = values.map((val, idx) => val > 0 ? idx : -1)
                                      .filter(idx => idx !== -1);
      const validValues = validQuarterIndices.map(idx => values[idx]);
      
      // Check if we have enough data
      if (validValues.length < 2) return { student, trend: "insufficient" };
      
      // Calculate trend statistics
      const trendStats = calculateTrendStatistics(validValues);
      
      // Find highest and lowest quarters
      let highestIndex = validQuarterIndices[0];
      let lowestIndex = validQuarterIndices[0];
      
      validQuarterIndices.forEach(idx => {
        if (values[idx] > values[highestIndex]) highestIndex = idx;
        if (values[idx] < values[lowestIndex]) lowestIndex = idx;
      });
      
      return {
        student,
        trend: trendStats.trend,
        percentChange: trendStats.totalPercentChange,
        highestQuarter: chartData[highestIndex].name,
        lowestQuarter: chartData[lowestIndex].name === chartData[highestIndex].name ? 
                        "Same as highest" : chartData[lowestIndex].name
      };
    });
    
    return {
      type: "quarterTrends",
      trends
    };
  };
  
  // Helper function for calculating trend statistics using linear regression
  const calculateTrendStatistics = (values) => {
    const n = values.length;
    const indices = Array.from({ length: n }, (_, i) => i + 1);
    
    // Calculate regression components
    const sumX = indices.reduce((sum, x) => sum + x, 0);
    const sumY = values.reduce((sum, y) => sum + y, 0);
    const sumXY = indices.reduce((sum, x, i) => sum + x * values[i], 0);
    const sumXX = indices.reduce((sum, x) => sum + x * x, 0);
    
    // Calculate slope and percentage change
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const avgValue = sumY / n;
    const totalPercentChange = (slope * (n - 1) / avgValue) * 100;
    
    // Determine trend
    let trend;
    if (totalPercentChange > 5) trend = "improving";
    else if (totalPercentChange < -5) trend = "declining";
    else trend = "stable";
    
    return { trend, totalPercentChange };
  };
  
  // For comparing section performance in a single quarter
  const generateSectionComparison = (chartData, selectedQuarter) => {
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
  };
  
  // For analyzing all sections across all quarters
  const generateOverallTrends = (chartData) => {
    // Get all section names

    const sectionNames = chartData.map(item => item.name);

    
    // Get quarter columns (excluding name and Average)
    const quarters = Object.keys(chartData[0]).filter(key => 
      key !== "name" && key !== "Average" && key.startsWith("Q")
    );
  
    // Calculate trends for each section
    const sectionTrends = calculateSectionTrends(chartData, sectionNames, quarters);
  
    // Filter and sort sections with valid trends
    const sectionsWithValidTrends = sectionTrends.filter(s => s.hasValidTrend);
    sectionsWithValidTrends.sort((a, b) => b.trend - a.trend);
  
    // Get sections with valid averages
    const sectionsWithValidAverage = sectionTrends.filter(s => s.average > 0);
    sectionsWithValidAverage.sort((a, b) => b.average - a.average);
  
    // Check if we have enough valid data
    if (sectionsWithValidTrends.length === 0 && sectionsWithValidAverage.length === 0) {
      return {
        type: " ",
        noValidData: true,
        message: "Insufficient valid grade data to analyze trends."
      };
    }
  
    // Calculate overall statistics
    const overallStats = calculateOverallStatistics(chartData, quarters);
  
    return {
      type: "overallTrends",
      mostImproved: sectionsWithValidTrends.length > 0 ? sectionsWithValidTrends[0] : null,
      mostDeclined: sectionsWithValidTrends.length > 0 ? sectionsWithValidTrends[sectionsWithValidTrends.length - 1] : null,
      highestAverage: sectionsWithValidAverage.length > 0 ? sectionsWithValidAverage[0] : null,
      overallAverage: overallStats.average,
      validDataPoints: overallStats.validDataPoints,
      missingDataPoints: overallStats.missingDataPoints
    };
  };
  
  // Helper function to calculate trends for each section
  const calculateSectionTrends = (chartData, sectionNames, quarters) => {
    return sectionNames.map(section => {
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
      
      // Calculate average across quarters
      const avgValue = validValues.reduce((sum, val) => sum + val, 0) / validValues.length;
      
      return {
        section,
        trend,
        hasValidTrend: true,
        average: avgValue
      };
    });
  };
  
  // Helper function to calculate overall statistics
  const calculateOverallStatistics = (chartData, quarters) => {
    const allGrades = [];
    quarters.forEach(quarter => {
      chartData.forEach(section => {
        const grade = parseFloat(section[quarter]) || 0;
        if (grade > 0) allGrades.push(grade);
      });
    });
  
    const overallAverage = allGrades.length > 0 
      ? (allGrades.reduce((sum, grade) => sum + grade, 0) / allGrades.length).toFixed(2) 
      : "N/A";
    
    return {
      average: overallAverage,
      validDataPoints: allGrades.length,
      missingDataPoints: (quarters.length * chartData.length) - allGrades.length
    };
  };
  
  // For analyzing a single section in a specific quarter
  const generateQuarterSnapshot = (chartData, selectedQuarter) => {
    const validStudents = chartData.filter(student => student.Grade > 0);
  
    // If no valid grades, return a special case
    if (validStudents.length === 0) {
      return {
        type: "quarterSnapshot",
        quarter: selectedQuarter,
        noValidData: true,
        message: "No valid grade data available for this quarter snapshot."
      };
    }
    
    // Sort students by grade (highest to lowest)
    const sortedStudents = [...validStudents].sort((a, b) => b.Grade - a.Grade);
    
    // Calculate basic statistics
    const basicStats = calculateBasicStatistics(validStudents, sortedStudents);
    
    // Calculate advanced statistics
    const advancedStats = calculateAdvancedStatistics(validStudents, basicStats.averageGrade);
    
    // Find highest and lowest scoring students
    const studentExtremes = findStudentExtremes(sortedStudents);
    
    // Return the quarter snapshot data
    return {
      type: "quarterSnapshot",
      quarter: selectedQuarter,
      highestStudents: studentExtremes.highest,
      lowestStudents: studentExtremes.lowest,
      allSameGrade: studentExtremes.allSameGrade,
      ...basicStats,
      ...advancedStats,
      validStudents: validStudents.length,
      totalStudents: chartData.length
    };
  };
  
  // Helper function to calculate basic statistics
  const calculateBasicStatistics = (validStudents, sortedStudents) => {
    // Calculate average grade
    const averageGrade = (sortedStudents.reduce((sum, student) => sum + student.Grade, 0) / sortedStudents.length).toFixed(2);
    
    // Calculate median grade
    const medianGrade = (() => {
      const middle = Math.floor(sortedStudents.length / 2);
      if (sortedStudents.length % 2 === 0) {
        return ((sortedStudents[middle - 1].Grade + sortedStudents[middle].Grade) / 2).toFixed(2);
      } else {
        return sortedStudents[middle].Grade.toFixed(2);
      }
    })();
    
    // Calculate min and max grades
    const minGrade = sortedStudents[sortedStudents.length - 1].Grade;
    const maxGrade = sortedStudents[0].Grade;
    const gradeRange = (maxGrade - minGrade).toFixed(2);
    
    return {
      averageGrade,
      medianGrade,
      minGrade,
      maxGrade,
      gradeRange
    };
  };
  
  // Helper function to calculate advanced statistics
  const calculateAdvancedStatistics = (validStudents, averageGrade) => {
    // Calculate mode grade
    const modeGrade = (() => {
      const gradeFrequency = {};
      let maxFrequency = 0;
      let modes = [];
    
      validStudents.forEach(student => {
        // Round to nearest tenth for mode calculation
        const roundedGrade = Math.round(student.Grade * 10) / 10;
        gradeFrequency[roundedGrade] = (gradeFrequency[roundedGrade] || 0) + 1;
        
        if (gradeFrequency[roundedGrade] > maxFrequency) {
          maxFrequency = gradeFrequency[roundedGrade];
          modes = [roundedGrade];
        } else if (gradeFrequency[roundedGrade] === maxFrequency) {
          modes.push(roundedGrade);
        }
      });
    
      return {
        values: modes,
        frequency: maxFrequency
      };
    })();
    
    // Calculate standard deviation
    const standardDeviation = (() => {
      const mean = parseFloat(averageGrade);
      const squaredDifferences = validStudents.map(student => Math.pow(student.Grade - mean, 2));
      const variance = squaredDifferences.reduce((sum, val) => sum + val, 0) / validStudents.length;
      return Math.sqrt(variance).toFixed(2);
    })();
    
    return {
      modeGrade,
      standardDeviation
    };
  };
  
  // Helper function to find highest and lowest scoring students
  const findStudentExtremes = (sortedStudents) => {
    // Find all highest scoring students
    const highestGrade = sortedStudents[0].Grade;
    const highestStudents = sortedStudents.filter(student => student.Grade === highestGrade)
      .map(student => ({
        student: student.name,
        grade: student.Grade
      }));
    
    // Find all lowest scoring students
    const lowestGrade = sortedStudents[sortedStudents.length - 1].Grade;
    const lowestStudents = sortedStudents.filter(student => student.Grade === lowestGrade)
      .map(student => ({
        student: student.name,
        grade: student.Grade
      }));
    
    // Determine if all students have the same grade
    const allSameGrade = highestGrade === lowestGrade;
    
    return {
      highest: highestStudents,
      lowest: lowestStudents,
      allSameGrade
    };
  };
  
  export default generateInsights;