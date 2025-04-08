import React, { useState } from 'react';
import { ArrowUpCircle, ArrowDownCircle, MinusCircle } from 'lucide-react';
import Pagination from '../pagination';
import { generateInsightsEnhanced } from './generate-insights'; // Import enhanced analysis function

const StudentChartAnalysis = ({ chartData, dataType, selectedQuarter }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isShowingAll, setIsShowingAll] = useState(false);
  const itemsPerPage = 3; // Show 3 trend items per page
  
  // Calculate stats using the enhanced analysis function
  const stats = generateInsightsEnhanced(chartData, dataType, selectedQuarter);

  if (!stats) return null;

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
      return stats.trends;
    }
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    return stats.trends.slice(startIndex, startIndex + itemsPerPage);
  };

  // Render highest grade with simplified tie handling
  const renderHighestGrade = () => {
    const { highest } = stats;
    
    if (highest.value <= 0) return null;
    
    return (
      <div className="mb-2">
        <div>
          <span className="font-medium text-green-600">Highest Grade:</span> {highest.value.toFixed(1)}
        </div>
        
        {/* If there are tied highest grades, list them all */}
        {highest.isTied ? (
          <ul className="ml-5 mt-1 space-y-1 text-gray-700">
            {highest.allMatches.map((match, idx) => (
              <li key={idx}>
                {dataType === "subjectsAcrossQuarters"
                  ? `${match.category} in ${match.dataKey}`
                  : `${match.dataKey} in ${match.category}`}
              </li>
            ))}
          </ul>
        ) : (
          <div className="ml-5 text-gray-700">
            {dataType === "subjectsAcrossQuarters" 
              ? `${highest.category} in ${highest.dataKey}` 
              : `${highest.dataKey} in ${highest.category}`}
          </div>
        )}
      </div>
    );
  };

  // Render lowest grade with simplified tie handling
  const renderLowestGrade = () => {
    const { lowest } = stats;
    
    if (lowest.value >= 100 || lowest.value <= 0) return null;
    if (stats.sameHighestAndLowest) return null;  // Don't show if same as highest
    
    return (
      <div className="mb-2">
        <div>
          <span className="font-medium text-amber-600">Lowest Grade:</span> {lowest.value.toFixed(1)}
        </div>
        
        {/* If there are tied lowest grades, list them all */}
        {lowest.isTied ? (
          <ul className="ml-5 mt-1 space-y-1 text-gray-700">
            {lowest.allMatches.map((match, idx) => (
              <li key={idx}>
                {dataType === "subjectsAcrossQuarters"
                  ? `${match.category} in ${match.dataKey}`
                  : `${match.dataKey} in ${match.category}`}
              </li>
            ))}
          </ul>
        ) : (
          <div className="ml-5 text-gray-700">
            {dataType === "subjectsAcrossQuarters" 
              ? `${lowest.category} in ${lowest.dataKey}` 
              : `${lowest.dataKey} in ${lowest.category}`}
          </div>
        )}
      </div>
    );
  };

  // Function to determine what to display in the analysis based on data type
  const renderAnalysisSections = () => {
    if (dataType === "subjectsInOneQuarter") {
      // For single quarter view, don't show trends
      return (
        <div className="grid grid-cols-1 gap-6">
          <div>
            <h4 className="text-lg font-medium text-gray-800 mb-2">Quarter {selectedQuarter} Performance</h4>
            <p className="text-gray-700 mb-4">{stats.performanceSummary}</p>
            
            <h4 className="text-lg font-medium text-gray-800 mb-2">Subject Grades</h4>
            {renderHighestGrade()}
            {renderLowestGrade()}
            
            {stats.sameHighestAndLowest && (
              <div className="mb-2 text-gray-700">
                All subjects have the same grade: {stats.highest.value.toFixed(1)}
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
          <p className="text-gray-700 mb-4">{stats.performanceSummary}</p>
          
          <h4 className="text-lg font-medium text-gray-800 mb-2">Key Metrics</h4>
          <div className="space-y-3 text-gray-700">
            {renderHighestGrade()}
            {renderLowestGrade()}
            
            {stats.sameHighestAndLowest && (
              <div className="mb-2 text-gray-700">
                All values are identical: {stats.highest.value.toFixed(1)}
              </div>
            )}
            
            {Object.keys(stats.averages).length > 0 && (
              <div>
                <div className="font-medium mt-2">
                  {dataType === "subjectsAcrossQuarters" ? "Quarter Averages:" : "Subject Averages:"}
                </div>
                <ul className="ml-5 space-y-1">
                  {Object.entries(stats.averages).map(([key, value]) => (
                    <li key={key}>
                      <span className="text-gray-600">{key}:</span>{' '}
                      {value === 'No data' ? <span className="text-amber-600">No data</span> : value}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div>
          <h4 className="text-lg font-medium text-gray-800 mb-2">
            {dataType === "subjectsAcrossQuarters" ? "Subject Progress" : "Quarter Progress"}
          </h4>
          {stats.trendSummary && (
            <p className="text-gray-700 mb-3">{stats.trendSummary}</p>
          )}
          
          {stats.trends.length > 0 ? (
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
          {stats.trends.length > itemsPerPage && (
            <Pagination
              totalItems={stats.trends.length}
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
                width: `${stats.assessmentCoverage}%`, 
                backgroundColor: stats.assessmentCoverage > 70 ? '#22c55e' : 
                               stats.assessmentCoverage > 40 ? '#f59e0b' : '#ef4444'
              }}
            ></div>
          </div>
          <span className="text-sm font-medium text-gray-700 ml-2">{stats.assessmentCoverage}%</span>
        </div>
        {stats.missingDataSummary && (
          <p className="text-sm text-amber-700">{stats.missingDataSummary}</p>
        )}
      </div>
      
      {renderAnalysisSections()}
    </div>
  );
};

export default StudentChartAnalysis;