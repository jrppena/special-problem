import React, { useMemo } from 'react';
import { ArrowUpCircle, ArrowDownCircle, MinusCircle } from 'lucide-react';

const TeacherChartAnalysis = ({ chartData, dataType, selectedQuarter }) => {
  const analysis = useMemo(() => {
    if (!chartData || chartData.length === 0) return null;

    // Extract data keys (excluding 'name' which is used for x-axis)
    const dataKeys = Object.keys(chartData[0]).filter(key => key !== 'name');
    
    // Calculate overall stats
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

    // Calculate averages for each data key, ignoring zeros (missing data)
    dataKeys.forEach(key => {
      const allValues = chartData.map(item => parseFloat(item[key]));
      const values = allValues.filter(val => !isNaN(val) && val > 0); // Exclude zeros as they mean no data
      
      // Check if there are valid values
      if (values.length > 0) {
        const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
        stats.averages[key] = avg.toFixed(2);
        
        // Find highest and lowest grades (only from valid data)
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
        
        if (minValue < stats.lowest.value && minValue > 0) { // Ensure we don't count zeros as lowest
          stats.lowest = {
            value: minValue,
            category: chartData[minItemIndex]?.name || '',
            dataKey: key
          };
        }
        
        // Enhanced trend analysis (only with non-zero values)
        if (values.length > 1) {
          // Find all non-zero values and their corresponding indices
          const nonZeroValues = [];
          const nonZeroIndices = [];
          
          allValues.forEach((val, idx) => {
            if (val > 0) {
              nonZeroValues.push(val);
              nonZeroIndices.push(idx);
            }
          });
          
          if (nonZeroIndices.length >= 2) {
            const firstNonZeroIndex = nonZeroIndices[0];
            const lastNonZeroIndex = nonZeroIndices[nonZeroIndices.length - 1];
            
            const firstValue = allValues[firstNonZeroIndex];
            const lastValue = allValues[lastNonZeroIndex];
            const difference = lastValue - firstValue;
            const percentChange = ((lastValue - firstValue) / firstValue * 100).toFixed(1);
            
            // Calculate trend slope
            let trendDirection = 'stable';
            if (difference > 5) {
              trendDirection = 'strong-increase';
            } else if (difference > 2) {
              trendDirection = 'slight-increase';
            } else if (difference < -5) {
              trendDirection = 'strong-decrease';
            } else if (difference < -2) {
              trendDirection = 'slight-decrease';
            }
            
            // Calculate volatility (standard deviation of changes between consecutive points)
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
            if (trendDirection === 'strong-increase') {
              trend = 'significant improvement';
            } else if (trendDirection === 'slight-increase') {
              trend = 'slight improvement';
            } else if (trendDirection === 'strong-decrease') {
              trend = 'significant decline';
            } else if (trendDirection === 'slight-decrease') {
              trend = 'slight decline';
            } else {
              trend = 'stable performance';
            }
            
            // Interpret consistency
            let consistency = 'consistent';
            if (volatility > 5) {
              consistency = 'highly variable';
            } else if (volatility > 2) {
              consistency = 'somewhat variable';
            }
            
            stats.trends.push({
              dataKey: key,
              trend,
              trendDirection,
              difference: difference.toFixed(2),
              percentChange,
              firstCategory: chartData[firstNonZeroIndex]?.name || '',
              lastCategory: chartData[lastNonZeroIndex]?.name || '',
              firstValue: firstValue.toFixed(1),
              lastValue: lastValue.toFixed(1),
              dataPoints: nonZeroValues.length,
              volatility: volatility.toFixed(1),
              consistency
            });
          }
        }
      } else {
        // If all values are zero or NaN, mark as no data
        stats.averages[key] = 'No data';
      }
    });
    
    // Calculate data coverage - how many cells have actual grades vs total cells
    const totalCells = dataKeys.length * chartData.length;
    const filledCells = dataKeys.reduce((count, key) => {
      return count + chartData.filter(item => parseFloat(item[key]) > 0).length;
    }, 0);
    
    stats.assessmentCoverage = totalCells > 0 ? Math.round((filledCells / totalCells) * 100) : 0;
    
    // Generate missing data summary
    if (stats.assessmentCoverage < 100) {
      stats.missingDataSummary = `${100 - stats.assessmentCoverage}% of grade data is not yet available.`;
      
      // Identify which categories are missing the most data
      const categoriesMissingData = chartData.map(item => {
        const missingCount = dataKeys.filter(key => parseFloat(item[key]) === 0).length;
        return {
          name: item.name,
          missingCount,
          missingPercentage: Math.round((missingCount / dataKeys.length) * 100)
        };
      }).filter(cat => cat.missingCount > 0)
        .sort((a, b) => b.missingPercentage - a.missingPercentage);
      
      if (categoriesMissingData.length > 0) {
        const topMissing = categoriesMissingData.slice(0, 3);
        if (topMissing.length > 0) {
          stats.missingDataSummary += ` Incomplete data for: ${topMissing.map(
            cat => `${cat.name} (${cat.missingPercentage}%)`
          ).join(', ')}.`;
        }
      }
    }
    
    // Generate trend summary
    if (stats.trends.length > 0) {
      const improvingTrends = stats.trends.filter(t => t.trend.includes('improvement')).length;
      const decliningTrends = stats.trends.filter(t => t.trend.includes('decline')).length;
      const stableTrends = stats.trends.filter(t => t.trend.includes('stable')).length;
      
      if (improvingTrends > decliningTrends && improvingTrends > stableTrends) {
        stats.trendSummary = `Overall positive trajectory with ${improvingTrends} of ${stats.trends.length} metrics showing improvement.`;
      } else if (decliningTrends > improvingTrends && decliningTrends > stableTrends) {
        stats.trendSummary = `Concerning trajectory with ${decliningTrends} of ${stats.trends.length} metrics showing decline.`;
      } else if (stableTrends > improvingTrends && stableTrends > decliningTrends) {
        stats.trendSummary = `Generally stable performance with ${stableTrends} of ${stats.trends.length} metrics showing consistent results.`;
      } else {
        stats.trendSummary = `Mixed performance trends with ${improvingTrends} improving, ${decliningTrends} declining, and ${stableTrends} stable metrics.`;
      }
    }
    
    // Generate performance summary (only if we have enough data)
    const validAverages = Object.values(stats.averages).filter(val => val !== 'No data').map(val => parseFloat(val));
    
    if (validAverages.length > 0) {
      const overallAvg = validAverages.reduce((sum, val) => sum + val, 0) / validAverages.length;
      
      if (overallAvg >= 90) {
        stats.performanceSummary = 'Excellent performance overall. Most students are achieving at a high level.';
      } else if (overallAvg >= 80) {
        stats.performanceSummary = 'Good performance overall. Most students are grasping the material well.';
      } else if (overallAvg >= 70) {
        stats.performanceSummary = 'Satisfactory performance overall, but there is room for improvement.';
      } else {
        stats.performanceSummary = 'Performance needs improvement. Consider intervention strategies.';
      }
    } else {
      stats.performanceSummary = 'Not enough data to provide a meaningful performance summary.';
    }
    
    return stats;
  }, [chartData]);

  if (!analysis) return null;

  // Helper function to render trend icons
  const renderTrendIcon = (trendDirection) => {
    switch(trendDirection) {
      case 'strong-increase':
        return <ArrowUpCircle className="text-green-600" size={20} />;
      case 'slight-increase':
        return <ArrowUpCircle className="text-green-400" size={20} />;
      case 'strong-decrease':
        return <ArrowDownCircle className="text-red-600" size={20} />;
      case 'slight-decrease':
        return <ArrowDownCircle className="text-red-400" size={20} />;
      default:
        return <MinusCircle className="text-gray-400" size={20} />;
    }
  };

  // Helper function to get trend color
  const getTrendColor = (trendDirection) => {
    switch(trendDirection) {
      case 'strong-increase':
      case 'slight-increase':
        return 'text-green-600';
      case 'strong-decrease':
      case 'slight-decrease':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow mt-5">
      <h3 className="text-xl font-semibold mb-4">Chart Analysis</h3>
      
      {/* Data coverage indicator */}
      <div className="mb-4">
        <div className="flex items-center mb-2">
          <span className="text-sm font-medium text-gray-700 mr-2">Data Coverage:</span>
          <div className="flex-1 bg-gray-200 rounded-full h-2.5">
            <div 
              className="h-2.5 rounded-full"
              style={{ 
                width: `${analysis.assessmentCoverage}%`, 
                backgroundColor: analysis.assessmentCoverage > 70 ? '#22c55e' : analysis.assessmentCoverage > 40 ? '#f59e0b' : '#ef4444'
              }}
            ></div>
          </div>
          <span className="text-sm font-medium text-gray-700 ml-2">{analysis.assessmentCoverage}%</span>
        </div>
        {analysis.missingDataSummary && (
          <p className="text-sm text-amber-700">{analysis.missingDataSummary}</p>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-lg font-medium text-gray-800 mb-2">Performance Overview</h4>
          <p className="text-gray-700 mb-4">{analysis.performanceSummary}</p>
          
          <h4 className="text-lg font-medium text-gray-800 mb-2">Key Statistics</h4>
          <ul className="space-y-2 text-gray-700">
            {analysis.highest.value > 0 && (
              <li>
                <span className="font-medium">Highest Grade:</span> {analysis.highest.value} 
                ({analysis.highest.dataKey} in {analysis.highest.category})
              </li>
            )}
            {analysis.lowest.value < 100 && analysis.lowest.value > 0 && (
              <li>
                <span className="font-medium">Lowest Grade:</span> {analysis.lowest.value}
                ({analysis.lowest.dataKey} in {analysis.lowest.category})
              </li>
            )}
            <li className="font-medium mt-2">Average Grades:</li>
            <ul className="ml-5 space-y-1">
              {Object.entries(analysis.averages).map(([key, value]) => (
                <li key={key}>
                  <span className="text-gray-600">{key}:</span>{' '}
                  {value === 'No data' ? <span className="text-amber-600">No data</span> : value}
                </li>
              ))}
            </ul>
          </ul>
        </div>

        <div>
          <h4 className="text-lg font-medium text-gray-800 mb-2">Trend Analysis</h4>
          {analysis.trendSummary && (
            <p className="text-gray-700 mb-3">{analysis.trendSummary}</p>
          )}
          
          {analysis.trends.length > 0 ? (
            <div className="space-y-4">
              {analysis.trends.map((trend, index) => (
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
            <p className="text-gray-700 mb-4">Not enough data points to analyze trends. More assessments are needed.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherChartAnalysis;