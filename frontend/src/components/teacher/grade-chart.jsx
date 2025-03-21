import React from "react";
import {
  LineChart,
  BarChart,
  AreaChart,
  RadarChart,
  Line,
  Bar,
  Area,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

const TeacherGradeChart = ({ chartType, data, dataType }) => {
  if (!data || data.length === 0) return null;

  // Extended color palette for more subjects/students
  const colors = [
    "#1E40AF", "#3B82F6", "#93C5FD", "#BFDBFE", 
    "#047857", "#10B981", "#6EE7B7", "#A7F3D0",
    "#B45309", "#F59E0B", "#FCD34D", "#FEF3C7",
    "#B91C1C", "#EF4444", "#FCA5A5", "#FEE2E2",
    "#6D28D9", "#8B5CF6", "#C4B5FD", "#EDE9FE",
    "#BE185D", "#EC4899", "#F9A8D4", "#FCE7F3",
    "#0F766E", "#14B8A6", "#5EEAD4", "#CCFBF1",
    "#4338CA", "#6366F1", "#A5B4FC", "#E0E7FF"
  ];

  // Function to get color based on index with improved distribution
  const getColor = (index) => {
    const step = 4;
    return colors[(index * step) % colors.length];
  };
  
  // Check if radar chart is compatible with the data
  const isRadarCompatible = () => {
    // Get available quarters in the data
    const quarters = Object.keys(data[0]).filter(key => 
      key !== "name" && key.startsWith("Q")
    );
    
    // If we're comparing sections but only have one quarter of data,
    // radar chart doesn't make sense
    if (quarters.length <= 1 && chartType === "radar" && dataType === "sectionsPerformance") {
      return false;
    }else if(chartType === "radar" && dataType === "singleSectionPerformance"){
      // Simply check if we have more than one quarter in the data array
      if (data[0].name != "Q1" && data[1].name != "Q2" && data[2].name != "Q3" && data[3].name != "Q4")  {
        return false;
      }
    }
    
    return true;
  };
  
  // If radar chart is not compatible, show error message
  if (chartType === "radar" && !isRadarCompatible()) {
    {console.log("Radar chart not compatible")}
    return (
      <ResponsiveContainer width="100%" height="100%">
        <div className="flex items-center justify-center h-full w-full flex-col">
          <div className="text-red-600 text-xl font-medium mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 inline-block mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Chart Type Not Compatible
          </div>
          <p className="text-gray-700 text-center max-w-md">
            Radar charts require data from multiple quarters when comparing sections. 
            Please select "All Quarters" or choose a different chart type.
          </p>
        </div>
      </ResponsiveContainer>
    );
  }

  // For most charts, use the original data structure
  if (chartType !== "radar") {
    // Get keys for chart (exclude 'name' which is used for x-axis)
    const dataKeys = Object.keys(data[0]).filter(key => key !== "name");
    
    const useAngledLabels = data.length > 8;
    const hideEveryNthLabel = Math.ceil(data.length / 12);
    
    const getChartMargin = () => {
      return useAngledLabels
        ? { top: 10, right: 30, left: 20, bottom: 100 }
        : { top: 10, right: 30, left: 20, bottom: 50 };
    };
    const chartMargin = getChartMargin();

    const getXAxisConfig = () => {
      if (useAngledLabels) {
        return {
          angle: -45,
          textAnchor: "end",
          height: 70,
          interval: 0,
          tickFormatter: (value, index) =>
            index % hideEveryNthLabel === 0 ? value : "",
          dy: 10
        };
      }
      return { interval: 0 };
    };
    const xAxisConfig = getXAxisConfig();

    const getYAxisDomain = () => {
      let minGrade = 100;
      data.forEach(item => {
        dataKeys.forEach(key => {
          const value = parseFloat(item[key]);
          if (!isNaN(value) && value < minGrade && value > 0) {
            minGrade = value;
          }
        });
      });
      const lowerBound = Math.max(0, Math.floor(minGrade / 5) * 5 - 5);
      return [lowerBound, 100];
    };
    const yAxisDomain = getYAxisDomain();

    switch (chartType) {
      case "line":
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={chartMargin}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                height={xAxisConfig.height || 30}
                angle={xAxisConfig.angle}
                textAnchor={xAxisConfig.textAnchor}
                interval={xAxisConfig.interval}
                tickFormatter={xAxisConfig.tickFormatter}
                dy={xAxisConfig.dy}
              />
              <YAxis domain={yAxisDomain} />
              <Tooltip />
              <Legend wrapperStyle={{ position: 'relative', marginTop: '20px' }} />
              {dataKeys.map((key, index) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  name={key}
                  stroke={getColor(index)}
                  strokeWidth={2}
                  activeDot={{ r: 8 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );
      case "bar":
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={chartMargin}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                height={xAxisConfig.height || 30}
                angle={xAxisConfig.angle}
                textAnchor={xAxisConfig.textAnchor}
                interval={xAxisConfig.interval}
                tickFormatter={xAxisConfig.tickFormatter}
                dy={xAxisConfig.dy}
              />
              <YAxis domain={yAxisDomain} />
              <Tooltip />
              <Legend wrapperStyle={{ position: 'relative', marginTop: '20px' }} />
              {dataKeys.map((key, index) => (
                <Bar
                  key={key}
                  dataKey={key}
                  name={key}
                  fill={getColor(index)}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );
      case "area":
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={chartMargin}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                height={xAxisConfig.height || 30}
                angle={xAxisConfig.angle}
                textAnchor={xAxisConfig.textAnchor}
                interval={xAxisConfig.interval}
                tickFormatter={xAxisConfig.tickFormatter}
                dy={xAxisConfig.dy}
              />
              <YAxis domain={yAxisDomain} />
              <Tooltip />
              <Legend wrapperStyle={{ position: 'relative', marginTop: '20px' }} />
              {dataKeys.map((key, index) => (
                <Area
                  key={key}
                  type="monotone"
                  dataKey={key}
                  name={key}
                  stroke={getColor(index)}
                  fill={getColor(index)}
                  fillOpacity={0.3}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  } else {
    // For radar chart, transform the data structure 
    // We need to transpose the data so quarters are categories around the radar
    const transformDataForRadar = () => {
      const result = [];
      const sections = data.map(item => item.name);
      const quarters = Object.keys(data[0]).filter(key => key !== "name");
      
      // Create one entry for each quarter
      quarters.forEach(quarter => {
        const entry = { name: quarter };
        
        // Add each section as a property
        sections.forEach(section => {
          const sectionData = data.find(item => item.name === section);
          entry[section] = sectionData[quarter];
        });
        
        result.push(entry);
      });
      
      return result;
    };
    
    const radarData = transformDataForRadar();
    const sectionKeys = data.map(item => item.name);
    
    // Calculate domain for radar chart
    const getRadarDomain = () => {
      let minGrade = 100;
      radarData.forEach(item => {
        sectionKeys.forEach(key => {
          const value = parseFloat(item[key]);
          if (!isNaN(value) && value < minGrade && value > 0) {
            minGrade = value;
          }
        });
      });
      const lowerBound = Math.max(0, Math.floor(minGrade / 5) * 5 - 5);
      return [lowerBound, 100];
    };
    const radarDomain = getRadarDomain();
    
    return (
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart outerRadius={90} data={radarData}>
          <PolarGrid />
          <PolarAngleAxis dataKey="name" />
          <PolarRadiusAxis angle={30} domain={radarDomain} />
          <Tooltip />
          <Legend wrapperStyle={{ position: 'relative', marginTop: '20px' }} />
          {sectionKeys.map((key, index) => (
            <Radar
              key={key}
              name={key}
              dataKey={key}
              stroke={getColor(index)}
              fill={getColor(index)}
              fillOpacity={0.3}
            />
          ))}
        </RadarChart>
      </ResponsiveContainer>
    );
  }
};

export default TeacherGradeChart;