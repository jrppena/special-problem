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

  // Get keys for chart (exclude 'name' which is used for x-axis)
  const dataKeys = Object.keys(data[0]).filter(key => key !== "name");

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

  const renderChart = () => {
    switch (chartType) {
      case "line":
        return (
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
        );
      case "bar":
        return (
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
        );
      case "area":
        return (
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
        );
      case "radar":
        return (
          <RadarChart outerRadius={90} data={data} margin={chartMargin}>
            <PolarGrid />
            <PolarAngleAxis dataKey="name" />
            <PolarRadiusAxis angle={30} domain={yAxisDomain} />
            <Tooltip />
            <Legend wrapperStyle={{ position: 'relative', marginTop: '20px' }} />
            {dataKeys.map((key, index) => (
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
        );
      default:
        return null;
    }
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      {renderChart()}
    </ResponsiveContainer>
  );
};

export default TeacherGradeChart;
