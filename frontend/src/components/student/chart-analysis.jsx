import React, { useMemo, useState } from 'react';
import { ArrowUpCircle, ArrowDownCircle, MinusCircle } from 'lucide-react';
import Pagination from '../../components/pagination';

const StudentChartAnalysis = ({ chartData, dataType, selectedQuarter }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isShowingAll, setIsShowingAll] = useState(false);
  const itemsPerPage = 3; // Show 3 trend items per page
  
  const analysis = useMemo(() => {
    if (!chartData || chartData.length === 0) return null;

    // Determine data keys based on dataType
    let dataKeys = [];
    if (dataType === "subjectsAcrossQuarters") {
      // For this type, data keys are Q1, Q2, Q3, Q4
      dataKeys = ["Q1", "Q2", "Q3", "Q4", "Average"].filter(key => 
        Object.keys(chartData[0]).includes(key)
      );
    } else if (dataType === "singleSubjectAcrossQuarters") {
      // For single subject, the data key is the subject name
      dataKeys = Object.keys(chartData[0]).filter(key => key !== 'name');
    } else if (dataType === "subjectsInOneQuarter") {
      // For this type, there's just one data key - "Grade"
      dataKeys = ["Grade"];
    }
    
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

    // Calculate statistics for each data key
    dataKeys.forEach(key => {
      // Skip "Average" key for trend analysis (but keep it for other stats)
      const allValues = chartData.map(item => parseFloat(item[key] || 0));
      const values = allValues.filter(val => !isNaN(val) && val > 0);

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

    // Calculate trend data based on dataType
    if (dataType === "subjectsAcrossQuarters") {
      // For each subject, analyze trends across quarters
      chartData.forEach(subject => {
        const quarterKeys = ["Q1", "Q2", "Q3", "Q4"].filter(key => Object.keys(subject).includes(key));
        
        // Get non-zero quarter values
        const quarterValues = [];
        const quarterNames = [];
        
        quarterKeys.forEach(qKey => {
          const value = parseFloat(subject[qKey]);
          if (!isNaN(value) && value > 0) {
            quarterValues.push(value);
            quarterNames.push(qKey);
          }
        });
        
        // Need at least 2 quarters to analyze trend
        if (quarterValues.length >= 2) {
          const firstValue = quarterValues[0];
          const lastValue = quarterValues[quarterValues.length - 1];
          const difference = lastValue - firstValue;
          const percentChange = ((lastValue - firstValue) / firstValue * 100).toFixed(1);
          
          let trendDirection = 'stable';
          if (difference > 5) trendDirection = 'strong-increase';
          else if (difference > 2) trendDirection = 'slight-increase';
          else if (difference < -5) trendDirection = 'strong-decrease';
          else if (difference < -2) trendDirection = 'slight-decrease';
          
          let volatility = 0;
          if (quarterValues.length > 2) {
            const changes = [];
            for (let i = 1; i < quarterValues.length; i++) {
              changes.push(quarterValues[i] - quarterValues[i-1]);
            }
            const meanChange = changes.reduce((sum, val) => sum + val, 0) / changes.length;
            const squaredDiffs = changes.map(change => Math.pow(change - meanChange, 2));
            volatility = Math.sqrt(squaredDiffs.reduce((sum, val) => sum + val, 0) / changes.length);
          }
          
          let trend = '';
          if (trendDirection === 'strong-increase') trend = 'significant improvement';
          else if (trendDirection === 'slight-increase') trend = 'slight improvement';
          else if (trendDirection === 'strong-decrease') trend = 'significant decline';
          else if (trendDirection === 'slight-decrease') trend = 'slight decline';
          else trend = 'stable performance';
          
          let consistency = 'consistent';
          if (volatility > 5) consistency = 'highly variable';
          else if (volatility > 2) consistency = 'somewhat variable';
          
          stats.trends.push({
            dataKey: subject.name,
            trend,
            trendDirection,
            difference: difference.toFixed(1),
            percentChange,
            firstCategory: quarterNames[0],
            lastCategory: quarterNames[quarterNames.length - 1],
            firstValue: firstValue.toFixed(1),
            lastValue: lastValue.toFixed(1),
            dataPoints: quarterValues.length,
            volatility: volatility.toFixed(1),
            consistency
          });
        }
      });
    } else if (dataType === "singleSubjectAcrossQuarters") {
      // For a single subject, analyze quarter-by-quarter trends
      const subjectKey = dataKeys[0]; // The subject name is the one data key
      
      // Need the non-zero quarters
      const nonZeroQuarters = [];
      const nonZeroValues = [];
      
      chartData.forEach(quarter => {
        const value = parseFloat(quarter[subjectKey]);
        if (!isNaN(value) && value > 0) {
          nonZeroQuarters.push(quarter.name);
          nonZeroValues.push(value);
        }
      });
      
      if (nonZeroValues.length >= 2) {
        const firstValue = nonZeroValues[0];
        const lastValue = nonZeroValues[nonZeroValues.length - 1];
        const difference = lastValue - firstValue;
        const percentChange = ((lastValue - firstValue) / firstValue * 100).toFixed(1);
        
        let trendDirection = 'stable';
        if (difference > 5) trendDirection = 'strong-increase';
        else if (difference > 2) trendDirection = 'slight-increase';
        else if (difference < -5) trendDirection = 'strong-decrease';
        else if (difference < -2) trendDirection = 'slight-decrease';
        
        let volatility = 0;
        if (nonZeroValues.length > 2) {
          const changes = [];
          for (let i = 1; i < nonZeroValues.length; i++) {
            changes.push(nonZeroValues[i] - nonZeroValues[i-1]);
          }
          const meanChange = changes.reduce((sum, val) => sum + val, 0) / changes.length;
          const squaredDiffs = changes.map(change => Math.pow(change - meanChange, 2));
          volatility = Math.sqrt(squaredDiffs.reduce((sum, val) => sum + val, 0) / changes.length);
        }
        
        let trend = '';
        if (trendDirection === 'strong-increase') trend = 'significant improvement';
        else if (trendDirection === 'slight-increase') trend = 'slight improvement';
        else if (trendDirection === 'strong-decrease') trend = 'significant decline';
        else if (trendDirection === 'slight-decrease') trend = 'slight decline';
        else trend = 'stable performance';
        
        let consistency = 'consistent';
        if (volatility > 5) consistency = 'highly variable';
        else if (volatility > 2) consistency = 'somewhat variable';
        
        stats.trends.push({
          dataKey: subjectKey,
          trend,
          trendDirection,
          difference: difference.toFixed(1),
          percentChange,
          firstCategory: nonZeroQuarters[0],
          lastCategory: nonZeroQuarters[nonZeroQuarters.length - 1],
          firstValue: firstValue.toFixed(1),
          lastValue: lastValue.toFixed(1),
          dataPoints: nonZeroValues.length,
          volatility: volatility.toFixed(1),
          consistency
        });
      }
    }
    // For subjectsInOneQuarter, we don't show trend analysis since it's just one quarter

    // Calculate data completeness metrics
    const totalPossibleDataPoints = (() => {
      if (dataType === "subjectsAcrossQuarters") {
        // Each subject should have 4 quarters
        return chartData.length * 4;
      } else if (dataType === "singleSubjectAcrossQuarters") {
        // One subject should have 4 quarters
        return 4;
      } else if (dataType === "subjectsInOneQuarter") {
        // Each subject should have one grade for the selected quarter
        return chartData.length;
      }
      return 0;
    })();
    
    // Count actual non-zero data points
    const actualDataPoints = (() => {
      if (dataType === "subjectsAcrossQuarters") {
        return chartData.reduce((count, subject) => {
          return count + ["Q1", "Q2", "Q3", "Q4"].filter(q => 
            parseFloat(subject[q]) > 0
          ).length;
        }, 0);
      } else if (dataType === "singleSubjectAcrossQuarters") {
        const subjectKey = dataKeys[0];
        return chartData.filter(q => parseFloat(q[subjectKey]) > 0).length;
      } else if (dataType === "subjectsInOneQuarter") {
        return chartData.filter(subject => parseFloat(subject.Grade) > 0).length;
      }
      return 0;
    })();
    
    stats.assessmentCoverage = totalPossibleDataPoints > 0 
      ? Math.round((actualDataPoints / totalPossibleDataPoints) * 100) 
      : 0;
    
    // Generate missing data summary if needed
    if (stats.assessmentCoverage < 100) {
      stats.missingDataSummary = `${100 - stats.assessmentCoverage}% of grade data is missing.`;
      
      if (dataType === "subjectsAcrossQuarters") {
        const missingBySubject = chartData.map(subject => {
          const missingQuarters = ["Q1", "Q2", "Q3", "Q4"].filter(q => 
            parseFloat(subject[q]) === 0
          );
          return {
            name: subject.name,
            missingCount: missingQuarters.length,
            missingQuarters: missingQuarters.join(', ')
          };
        }).filter(item => item.missingCount > 0);
        
        if (missingBySubject.length > 0) {
          const topMissing = missingBySubject.sort((a, b) => b.missingCount - a.missingCount).slice(0, 3);
          stats.missingDataSummary += ` Most missing: ${topMissing.map(
            item => `${item.name} (${item.missingQuarters})`
          ).join(', ')}.`;
        }
      } else if (dataType === "singleSubjectAcrossQuarters") {
        const subjectKey = dataKeys[0];
        const missingQuarters = chartData
          .filter(q => parseFloat(q[subjectKey]) === 0)
          .map(q => q.name);
        
        if (missingQuarters.length > 0) {
          stats.missingDataSummary += ` Missing quarters: ${missingQuarters.join(', ')}.`;
        }
      }
    }
    
    // Generate trend summary if applicable
    if (stats.trends.length > 0) {
      const improvingTrends = stats.trends.filter(t => t.trend.includes('improvement')).length;
      const decliningTrends = stats.trends.filter(t => t.trend.includes('decline')).length;
      const stableTrends = stats.trends.filter(t => t.trend.includes('stable')).length;
      
      if (dataType === "singleSubjectAcrossQuarters") {
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
        if (improvingTrends > decliningTrends && improvingTrends > stableTrends) {
          stats.trendSummary = `Positive trends in ${improvingTrends} of ${stats.trends.length} subjects.`;
        } else if (decliningTrends > improvingTrends && decliningTrends > stableTrends) {
          stats.trendSummary = `Concerning declines in ${decliningTrends} of ${stats.trends.length} subjects.`;
        } else if (stableTrends > improvingTrends && stableTrends > decliningTrends) {
          stats.trendSummary = `Stable performance in ${stableTrends} of ${stats.trends.length} subjects.`;
        } else {
          stats.trendSummary = `Mixed trends: ${improvingTrends} improving, ${decliningTrends} declining subjects.`;
        }
      }
    }
    
    // Generate overall performance summary
    let overallAverage = 0;
    let validGradeCount = 0;

    if (dataType === "subjectsAcrossQuarters") {
      // For this type, we can use the Average column if available
      const averages = chartData
        .map(item => parseFloat(item.Average))
        .filter(val => !isNaN(val) && val > 0);
      
      if (averages.length > 0) {
        overallAverage = averages.reduce((sum, val) => sum + val, 0) / averages.length;
        validGradeCount = averages.length;
      }
    } else {
      // For other types, calculate from the data
      const allGrades = [];
      
      if (dataType === "singleSubjectAcrossQuarters") {
        const subjectKey = dataKeys[0];
        chartData.forEach(q => {
          const grade = parseFloat(q[subjectKey]);
          if (!isNaN(grade) && grade > 0) {
            allGrades.push(grade);
          }
        });
      } else if (dataType === "subjectsInOneQuarter") {
        chartData.forEach(subject => {
          const grade = parseFloat(subject.Grade);
          if (!isNaN(grade) && grade > 0) {
            allGrades.push(grade);
          }
        });
      }
      
      if (allGrades.length > 0) {
        overallAverage = allGrades.reduce((sum, val) => sum + val, 0) / allGrades.length;
        validGradeCount = allGrades.length;
      }
    }
    
    if (validGradeCount > 0) {
      if (overallAverage >= 90) {
        stats.performanceSummary = 'Excellent overall performance. Keep up the great work!';
      } else if (overallAverage >= 80) {
        stats.performanceSummary = 'Strong performance overall with grades in the B range.';
      } else if (overallAverage >= 70) {
        stats.performanceSummary = 'Solid performance overall with grades in the C range.';
      } else if (overallAverage >= 60) {
        stats.performanceSummary = 'Passing performance, but there\'s room for improvement.';
      } else {
        stats.performanceSummary = 'Performance below passing level. Consider seeking additional help.';
      }
    } else {
      stats.performanceSummary = 'Not enough data to evaluate overall performance.';
    }
    
    return stats;
  }, [chartData, dataType, selectedQuarter]);

  if (!analysis) return null;

  const renderTrendIcon = (trendDirection) => {
    switch(trendDirection) {
      case 'strong-increase': return <ArrowUpCircle className="text-green-600" size={20} />;
      case 'slight-increase': return <ArrowUpCircle className="text-green-400" size={20} />;
      case 'strong-decrease': return <ArrowDownCircle className="text-red-600" size={20} />;
      case 'slight-decrease': return <ArrowDownCircle className="text-red-400" size={20} />;
      default: return <MinusCircle className="text-gray-400" size={20} />;
    }
  };

  const getTrendColor = (trendDirection) => {
    switch(trendDirection) {
      case 'strong-increase':
      case 'slight-increase': return 'text-green-600';
      case 'strong-decrease':
      case 'slight-decrease': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  // Get paginated trends based on current page and "show all" toggle
  const getPaginatedTrends = () => {
    if (isShowingAll) {
      return analysis.trends;
    }
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    return analysis.trends.slice(startIndex, startIndex + itemsPerPage);
  };

  // Function to determine what to display in the analysis based on data type
  const renderAnalysisSections = () => {
    if (dataType === "subjectsInOneQuarter") {
      // For single quarter view, don't show trends
      return (
        <div className="grid grid-cols-1 gap-6">
          <div>
            <h4 className="text-lg font-medium text-gray-800 mb-2">Quarter {selectedQuarter} Performance</h4>
            <p className="text-gray-700 mb-4">{analysis.performanceSummary}</p>
            
            <h4 className="text-lg font-medium text-gray-800 mb-2">Subject Grades</h4>
            {analysis.highest.value > 0 && (
              <div className="mb-2">
                <span className="font-medium text-green-600">Highest Grade:</span> {analysis.highest.value} in {analysis.highest.category}
              </div>
            )}
            
            {analysis.lowest.value < 100 && analysis.lowest.value > 0 && (
              <div className="mb-2">
                <span className="font-medium text-amber-600">Lowest Grade:</span> {analysis.lowest.value} in {analysis.lowest.category}
              </div>
            )}
          </div>
        </div>
      );
    }
    
    // For quarter trends or subject trends, show more detailed analysis
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-lg font-medium text-gray-800 mb-2">Overall Performance</h4>
          <p className="text-gray-700 mb-4">{analysis.performanceSummary}</p>
          
          <h4 className="text-lg font-medium text-gray-800 mb-2">Key Metrics</h4>
          <ul className="space-y-2 text-gray-700">
            {analysis.highest.value > 0 && (
              <li>
                <span className="font-medium">Highest Grade:</span> {analysis.highest.value} 
                {dataType === "subjectsAcrossQuarters" 
                  ? ` (${analysis.highest.category} in ${analysis.highest.dataKey})` 
                  : ` (${analysis.highest.dataKey} in ${analysis.highest.category})`}
              </li>
            )}
            {analysis.lowest.value < 100 && analysis.lowest.value > 0 && (
              <li>
                <span className="font-medium">Lowest Grade:</span> {analysis.lowest.value}
                {dataType === "subjectsAcrossQuarters" 
                  ? ` (${analysis.lowest.category} in ${analysis.lowest.dataKey})` 
                  : ` (${analysis.lowest.dataKey} in ${analysis.lowest.category})`}
              </li>
            )}
            {Object.keys(analysis.averages).length > 0 && (
              <>
                <li className="font-medium mt-2">
                  {dataType === "subjectsAcrossQuarters" ? "Quarter Averages:" : "Subject Averages:"}
                </li>
                <ul className="ml-5 space-y-1">
                  {Object.entries(analysis.averages).map(([key, value]) => (
                    <li key={key}>
                      <span className="text-gray-600">{key}:</span>{' '}
                      {value === 'No data' ? <span className="text-amber-600">No data</span> : value}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </ul>
        </div>

        <div>
          <h4 className="text-lg font-medium text-gray-800 mb-2">
            {dataType === "subjectsAcrossQuarters" ? "Subject Progress" : "Quarter Progress"}
          </h4>
          {analysis.trendSummary && (
            <p className="text-gray-700 mb-3">{analysis.trendSummary}</p>
          )}
          
          {analysis.trends.length > 0 ? (
            <div className="space-y-4">
              {getPaginatedTrends().map((trend, index) => (
                <div key={index} className="border rounded-md p-3">
                  <div className="flex items-center mb-2">
                    {renderTrendIcon(trend.trendDirection)}
                    <span className="font-medium ml-2">{trend.dataKey}</span>
                    <span className={`ml-auto ${getTrendColor(trend.trendDirection)}`}>
                      {trend.difference > 0 ? '+' : ''}{trend.difference} points ({trend.percentChange}%)
                    </span>
                  </div>
                  <div className="text-sm grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-gray-500">From:</span> {trend.firstValue} ({trend.firstCategory})
                    </div>
                    <div>
                      <span className="text-gray-500">To:</span> {trend.lastValue} ({trend.lastCategory})
                    </div>
                    <div>
                      <span className="text-gray-500">Data points:</span> {trend.dataPoints}
                    </div>
                    <div>
                      <span className="text-gray-500">Consistency:</span> {trend.consistency}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-700 mb-4">
              {dataType === "subjectsAcrossQuarters" 
                ? "Not enough data to show subject trends. Need grades from multiple quarters."
                : "Not enough data to show quarterly trends. Need grades from multiple quarters."}
            </p>
          )}
          
          {/* Only show pagination if there are more than itemsPerPage trends */}
          {analysis.trends.length > itemsPerPage && (
            <Pagination
              totalItems={analysis.trends.length}
              itemsPerPage={itemsPerPage}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              isShowingAll={isShowingAll}
              setIsShowingAll={setIsShowingAll}
            />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow mt-5">
      <h3 className="text-xl font-semibold mb-4">
        {dataType === "subjectsAcrossQuarters" ? "Subjects Performance Analysis" :
         dataType === "singleSubjectAcrossQuarters" ? "Quarterly Performance Analysis" :
         `Quarter ${selectedQuarter} Analysis`}
      </h3>
      
      <div className="mb-6">
        <div className="flex items-center mb-2">
          <span className="text-sm font-medium text-gray-700 mr-2">Grade Data Completeness:</span>
          <div className="flex-1 bg-gray-200 rounded-full h-2.5">
            <div 
              className="h-2.5 rounded-full"
              style={{ 
                width: `${analysis.assessmentCoverage}%`, 
                backgroundColor: analysis.assessmentCoverage > 70 ? '#22c55e' : 
                               analysis.assessmentCoverage > 40 ? '#f59e0b' : '#ef4444'
              }}
            ></div>
          </div>
          <span className="text-sm font-medium text-gray-700 ml-2">{analysis.assessmentCoverage}%</span>
        </div>
        {analysis.missingDataSummary && (
          <p className="text-sm text-amber-700">{analysis.missingDataSummary}</p>
        )}
      </div>
      
      {renderAnalysisSections()}
    </div>
  );
};

export default StudentChartAnalysis;