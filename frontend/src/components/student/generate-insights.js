// analysis.js - Optimized grade analysis functions

// Constants for reuse
const QUARTERS = ["Q1", "Q2", "Q3", "Q4"];
const GRADE_THRESHOLDS = [
  { min: 95, message: 'Outstanding performance. Keep it up!' },
  { min: 90, message: 'Excellent overall performance. Keep up the great work!' },
  { min: 85, message: 'Good performance overall. Meeting expectations.' },
  { min: 0, message: 'Performance below passing level. Consider seeking additional help.' }
];

const TREND_THRESHOLDS = [
  { threshold: 5, direction: 'strong-increase', description: 'significant improvement' },
  { threshold: 2, direction: 'slight-increase', description: 'slight improvement' },
  { threshold: -2, direction: 'stable', description: 'stable performance' },
  { threshold: -5, direction: 'slight-decrease', description: 'slight decline' },
  { threshold: -Infinity, direction: 'strong-decrease', description: 'significant decline' }
];
const VOLATILITY_LEVELS = [
  { threshold: 5, description: 'highly variable' },
  { threshold: 2, description: 'somewhat variable' },
  { threshold: 0, description: 'consistent' }
];

/**
 * Determines which data keys to analyze based on the data type
 */
const determineDataKeys = (chartData, dataType) => {
  if (!chartData || !chartData[0]) return [];
  
  switch (dataType) {
    case "subjectsAcrossQuarters":
      return ["Q1", "Q2", "Q3", "Q4", "Average"].filter(key => 
        Object.keys(chartData[0]).includes(key)
      );
    case "singleSubjectAcrossQuarters":
      return Object.keys(chartData[0]).filter(key => key !== 'name');
    case "subjectsInOneQuarter":
      return ["Grade"];
    default:
      return [];
  }
};

/**
 * Safely parses a number and returns 0 if not valid
 */
const safeParseFloat = (value) => {
  const parsed = parseFloat(value);
  return !isNaN(parsed) && parsed > 0 ? parsed : 0;
};

/**
 * Calculates basic statistics for the chart data
 */
const calculateBasicStats = (chartData, dataKeys, stats) => {
  dataKeys.forEach(key => {
    const allValues = chartData.map(item => safeParseFloat(item[key]));
    const values = allValues.filter(val => val > 0);

    if (values.length > 0) {
      const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
      stats.averages[key] = avg.toFixed(1);

      const maxValue = Math.max(...values);
      const maxItemIndex = allValues.findIndex(val => val === maxValue);
      
      const minValue = Math.min(...values);
      const minItemIndex = allValues.findIndex(val => val === minValue);

      if (maxValue > stats.highest.value) {
        stats.highest = {
          value: maxValue,
          category: chartData[maxItemIndex]?.name || '',
          dataKey: key
        };
      }
      
      if (minValue < stats.lowest.value && minValue > 0) {
        stats.lowest = {
          value: minValue,
          category: chartData[minItemIndex]?.name || '',
          dataKey: key
        };
      }
    } else {
      stats.averages[key] = 'No data';
    }
  });
};

/**
 * Gets trend direction and description based on the difference
 */
const getTrendInfo = (difference) => {
  const trendInfo = TREND_THRESHOLDS.find(t => difference > t.threshold);
  return {
    direction: trendInfo.direction,
    description: trendInfo.description
  };
};

/**
 * Gets consistency description based on volatility
 */
const getConsistencyDescription = (volatility) => {
  const level = VOLATILITY_LEVELS.find(level => volatility > level.threshold);
  // If no level is found (e.g., volatility ≤ 0), return 'consistent' as default
  return level ? level.description : 'consistent';
};

/**
 * Calculates volatility from a series of values
 */
const calculateVolatility = (values) => {
  if (values.length <= 2) return 0;
  
  const changes = [];
  for (let i = 1; i < values.length; i++) {
    changes.push(values[i] - values[i-1]);
  }
  
  const meanChange = changes.reduce((sum, val) => sum + val, 0) / changes.length;
  const squaredDiffs = changes.map(change => Math.pow(change - meanChange, 2));
  return Math.sqrt(squaredDiffs.reduce((sum, val) => sum + val, 0) / changes.length);
};

/**
 * Creates a trend analysis object from values
 */
const createTrendAnalysis = (dataKey, values, categories) => {
  const firstValue = values[0];
  const lastValue = values[values.length - 1];
  const difference = lastValue - firstValue;
  const percentChange = ((lastValue - firstValue) / firstValue * 100).toFixed(1);
  
  const { direction, description } = getTrendInfo(difference);
  const volatility = calculateVolatility(values);
  const consistency = getConsistencyDescription(volatility);
  
  return {
    dataKey,
    trend: description,
    trendDirection: direction,
    difference: difference.toFixed(1),
    percentChange,
    firstCategory: categories[0],
    lastCategory: categories[categories.length - 1],
    firstValue: firstValue.toFixed(1),
    lastValue: lastValue.toFixed(1),
    dataPoints: values.length,
    volatility: volatility.toFixed(1),
    consistency
  };
};

/**
 * Analyzes subject trends across quarters
 */
const analyzeSubjectTrend = (subject) => {
  const quarterKeys = QUARTERS.filter(key => Object.keys(subject).includes(key));
  
  // Get non-zero quarter values
  const quarterValues = [];
  const quarterNames = [];
  
  quarterKeys.forEach(qKey => {
    const value = safeParseFloat(subject[qKey]);
    if (value > 0) {
      quarterValues.push(value);
      quarterNames.push(qKey);
    }
  });
  
  // Need at least 2 quarters to analyze trend
  if (quarterValues.length < 2) return null;

  return createTrendAnalysis(subject.name, quarterValues, quarterNames);
};

/**
 * Analyzes quarter-by-quarter trends for a single subject
 */
const analyzeQuarterTrend = (chartData, subjectKey) => {
  // Need the non-zero quarters
  const nonZeroQuarters = [];
  const nonZeroValues = [];
  
  chartData.forEach(quarter => {
    const value = safeParseFloat(quarter[subjectKey]);
    if (value > 0) {
      nonZeroQuarters.push(quarter.name);
      nonZeroValues.push(value);
    }
  });
  
  // Need at least 2 quarters to analyze trend
  if (nonZeroValues.length < 2) return null;

  return createTrendAnalysis(subjectKey, nonZeroValues, nonZeroQuarters);
};

/**
 * Analyzes trends based on the data type
 */
const analyzeTrends = (chartData, dataType, dataKeys, stats) => {
  if (dataType === "subjectsAcrossQuarters") {
    // For each subject, analyze trends across quarters
    chartData.forEach(subject => {
      const trendData = analyzeSubjectTrend(subject);
      if (trendData) stats.trends.push(trendData);
    });
  } else if (dataType === "singleSubjectAcrossQuarters" && dataKeys.length > 0) {
    // For a single subject, analyze quarter-by-quarter trends
    const trendData = analyzeQuarterTrend(chartData, dataKeys[0]);
    if (trendData) stats.trends.push(trendData);
  }
};

/**
 * Calculates data completeness metrics
 */
const calculateDataCompleteness = (chartData, dataType, dataKeys, stats) => {
  let totalPossibleDataPoints = 0;
  let actualDataPoints = 0;
  
  switch (dataType) {
    case "subjectsAcrossQuarters":
      totalPossibleDataPoints = chartData.length * 4;
      actualDataPoints = chartData.reduce((count, subject) => {
        return count + QUARTERS.filter(q => 
          safeParseFloat(subject[q]) > 0
        ).length;
      }, 0);
      break;
      
    case "singleSubjectAcrossQuarters":
      totalPossibleDataPoints = 4;
      if (dataKeys.length > 0) {
        const subjectKey = dataKeys[0];
        actualDataPoints = chartData.filter(q => safeParseFloat(q[subjectKey]) > 0).length;
      }
      break;
      
    case "subjectsInOneQuarter":
      totalPossibleDataPoints = chartData.length;
      actualDataPoints = chartData.filter(subject => safeParseFloat(subject.Grade) > 0).length;
      break;
  }
  
  stats.assessmentCoverage = totalPossibleDataPoints > 0 
    ? Math.round((actualDataPoints / totalPossibleDataPoints) * 100) 
    : 0;
};

/**
 * Generates missing data summary
 */
const generateMissingDataSummary = (chartData, dataType, dataKeys, stats) => {
  if (stats.assessmentCoverage >= 100) return;
  
  const missingPercentage = 100 - stats.assessmentCoverage;
  stats.missingDataSummary = `${missingPercentage}% of grade data is missing.`;
  
  if (dataType === "subjectsAcrossQuarters") {
    const missingBySubject = chartData.map(subject => {
      const missingQuarters = QUARTERS.filter(q => 
        safeParseFloat(subject[q]) === 0
      );
      return {
        name: subject.name,
        missingCount: missingQuarters.length,
        missingQuarters: missingQuarters.join(', ')
      };
    }).filter(item => item.missingCount > 0);
    
    if (missingBySubject.length > 0) {
      const topMissing = missingBySubject
        .sort((a, b) => b.missingCount - a.missingCount)
        .slice(0, 3);
        
      stats.missingDataSummary += ` Most missing: ${topMissing.map(
        item => `${item.name} (${item.missingQuarters})`
      ).join(', ')}.`;
    }
  } else if (dataType === "singleSubjectAcrossQuarters" && dataKeys.length > 0) {
    const subjectKey = dataKeys[0];
    const missingQuarters = chartData
      .filter(q => safeParseFloat(q[subjectKey]) === 0)
      .map(q => q.name);
    
    if (missingQuarters.length > 0) {
      stats.missingDataSummary += ` Missing quarters: ${missingQuarters.join(', ')}.`;
    }
  }
};

/**
 * Generates trend summary based on trends data
 */
const generateTrendSummary = (dataType, stats) => {
  if (stats.trends.length === 0) return;
  
  const improvingTrends = stats.trends.filter(t => t.trend.includes('improvement')).length;
  const decliningTrends = stats.trends.filter(t => t.trend.includes('decline')).length;
  const stableTrends = stats.trends.filter(t => t.trend.includes('stable')).length;
  
  if (dataType === "singleSubjectAcrossQuarters" && stats.trends.length > 0) {
    // For single subject, be more direct about the one trend
    const trend = stats.trends[0];
    if (trend.trend.includes('improvement')) {
      stats.trendSummary = `Grades are improving from ${trend.firstCategory} to ${trend.lastCategory}.`;
    } else if (trend.trend.includes('decline')) {
      stats.trendSummary = `Grades have declined from ${trend.firstCategory} to ${trend.lastCategory}.`;
    } else {
      stats.trendSummary = `Performance has remained stable across quarters.`;
    }
  } else {
    // For multiple subjects
    const totalTrends = stats.trends.length;
    if (improvingTrends > decliningTrends && improvingTrends > stableTrends) {
      stats.trendSummary = `Positive trends in ${improvingTrends} of ${totalTrends} subjects.`;
    } else if (decliningTrends > improvingTrends && decliningTrends > stableTrends) {
      stats.trendSummary = `Concerning declines in ${decliningTrends} of ${totalTrends} subjects.`;
    } else if (stableTrends > improvingTrends && stableTrends > decliningTrends) {
      stats.trendSummary = `Stable performance in ${stableTrends} of ${totalTrends} subjects.`;
    } else {
      stats.trendSummary = `Mixed trends: ${improvingTrends} improving, ${decliningTrends} declining subjects.`;
    }
  }
};

/**
 * Gets performance summary message based on average grade
 */
const getPerformanceSummary = (average) => {
  return GRADE_THRESHOLDS.find(threshold => average >= threshold.min).message;
};

/**
 * Calculates overall performance metrics and generates summary
 */
const generatePerformanceSummary = (chartData, dataType, dataKeys, stats) => {
  let validGrades = [];

  if (dataType === "subjectsAcrossQuarters") {
    // For this type, we can use the Average column if available
    validGrades = chartData
      .map(item => safeParseFloat(item.Average))
      .filter(val => val > 0);
  } else if (dataType === "singleSubjectAcrossQuarters" && dataKeys.length > 0) {
    const subjectKey = dataKeys[0];
    validGrades = chartData
      .map(q => safeParseFloat(q[subjectKey]))
      .filter(val => val > 0);
  } else if (dataType === "subjectsInOneQuarter") {
    validGrades = chartData
      .map(subject => safeParseFloat(subject.Grade))
      .filter(val => val > 0);
  }
  
  if (validGrades.length > 0) {
    const overallAverage = validGrades.reduce((sum, val) => sum + val, 0) / validGrades.length;
    stats.performanceSummary = getPerformanceSummary(overallAverage);
  } else {
    stats.performanceSummary = 'Not enough data to evaluate overall performance.';
  }
};

/**
 * Generates all summary information
 */
const generateSummaries = (chartData, dataType, dataKeys, stats) => {
  generateMissingDataSummary(chartData, dataType, dataKeys, stats);
  generateTrendSummary(dataType, stats);
  generatePerformanceSummary(chartData, dataType, dataKeys, stats);
};

/**
 * Main function to generate insights from chart data
 */
export const generateInsights = (chartData, dataType, selectedQuarter) => {
  if (!chartData || chartData.length === 0) return null;

  // Initialize stats object
  const stats = {
    averages: {},
    highest: { value: 0, category: '', dataKey: '' },
    lowest: { value: 100, category: '', dataKey: '' },   
    trends: [],
    trendSummary: '',
    performanceSummary: '',
    missingDataSummary: '',
    assessmentCoverage: 0
  };

  const dataKeys = determineDataKeys(chartData, dataType);
  
  calculateBasicStats(chartData, dataKeys, stats);
  analyzeTrends(chartData, dataType, dataKeys, stats);
  calculateDataCompleteness(chartData, dataType, dataKeys, stats);
  generateSummaries(chartData, dataType, dataKeys, stats);

  return stats;
};