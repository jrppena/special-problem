import React from "react";
import {
  LineChart,
  BarChart,
  AreaChart,
  RadarChart,
  PieChart,
  Line,
  Bar,
  Area,
  Radar,
  Pie,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from "recharts";

const getAxisLabel = (dataType) => {
  switch (dataType) {
    case "singleSubjectAcrossQuarters":
      return { xAxis: "Quarters", yAxis: "Grade Value" };
    case "subjectsAcrossQuarters":
      return { xAxis: "Subject Name", yAxis: "Grade Value" };
    case "subjectsInOneQuarter":
      return { xAxis: "Subject Name", yAxis: "Grade Value" };
    default:
      return { xAxis: "Grade Value", yAxis: "Subject Name" };
  }
};

const GradeChart = ({ chartType, data, dataType }) => {
  if (!data || data.length === 0) return null;

  // Get keys for chart (exclude 'name' which is used for x-axis)
  const dataKeys = Object.keys(data[0]).filter(key => key !== "name");
  const { xAxis, yAxis } = getAxisLabel(dataType);
  // Extended color palette for more subjects
  // Combined multiple color palettes for more variety
  const colors = [
    // Blues
    "#1E40AF", "#3B82F6", "#93C5FD", "#BFDBFE", 
    // Greens
    "#047857", "#10B981", "#6EE7B7", "#A7F3D0",
    // Oranges/Yellows
    "#B45309", "#F59E0B", "#FCD34D", "#FEF3C7",
    // Reds
    "#B91C1C", "#EF4444", "#FCA5A5", "#FEE2E2",
    // Purples
    "#6D28D9", "#8B5CF6", "#C4B5FD", "#EDE9FE",
    // Pinks
    "#BE185D", "#EC4899", "#F9A8D4", "#FCE7F3",
    // Teals
    "#0F766E", "#14B8A6", "#5EEAD4", "#CCFBF1",
    // Indigos
    "#4338CA", "#6366F1", "#A5B4FC", "#E0E7FF"
  ];

  // Function to get color based on index with improved distribution
  const getColor = (index) => {
    // Use a mathematical pattern to distribute colors better
    // Skip every few colors to get more contrast between adjacent items
    const step = 4; // Adjust this value to change color distribution
    return colors[(index * step) % colors.length];
  };

  // Determine if we should use scrollable chart based on data length
  const useScrollableChart = data.length > 8;
  const hideEveryNthLabel = Math.ceil(data.length / 12); // Show at most ~12 labels

  // Calculate chart margins based on data size
  const getChartMargin = () => {
    return { top: 10, right: 30, left: 20, bottom: 50 };
  };

  const chartMargin = getChartMargin();

  // X-Axis configuration - no more angled labels
  const getXAxisConfig = () => {
    return {
      interval: 0, // Show all labels
      textAnchor: "middle"
    };
  };

  const xAxisConfig = getXAxisConfig();

  // Calculate minimum width for scrollable charts
  const getMinWidth = () => {
    // For line and area charts, ensure enough space per data point
    if ((chartType === "line" || chartType === "area") && useScrollableChart) {
      // Calculate based on number of data points and available width
      // Each data point needs more space to prevent label overlap
      const baseWidth = Math.max(120 * data.length, 500);
      // If we have many data keys (lines), add even more space
      return baseWidth + (dataKeys.length > 2 ? dataKeys.length * 50 : 0);
    }
    return "100%";
  };

  // Generate chart based on selected chart type
const renderChart = () => {
  switch (chartType) {
    case "line":
      return (
        <LineChart data={data} margin={chartMargin}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="name" 
            height={30}
            label={{ value: xAxis, position: "bottom", offset: 0 }}
            textAnchor={xAxisConfig.textAnchor}
            interval={xAxisConfig.interval}
            tick={{ fontSize: 12 }}
            padding={{ left: 10, right: 10 }}
          />
          <YAxis 
            domain={[85,100]} 
            label={{ value: yAxis, angle: -90, position: "insideLeft", offset: -5 }}
          />
          <Tooltip />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            wrapperStyle={{ 
              paddingTop: '10px',
              bottom: 0
            }} 
          />
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
      // Calculate dynamic width for Y-axis based on longest label
      const maxLabelLength = Math.max(...data.map(item => item.name.length));
      const dynamicWidth = Math.min(Math.max(maxLabelLength * 8, 150), 250);
      
      return (
        <BarChart 
          layout="vertical" 
          data={data} 
          margin={{...chartMargin, left: 20}}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            type="number"
            domain={[85, 100]} 
            label={{ value: yAxis, position: "bottom", offset: 0 }}
          />
          <YAxis 
            dataKey="name" 
            type="category"
            width={dynamicWidth}
            textAnchor="end"
            interval={0}
            label={{ value: xAxis, angle: -90, position: "insideLeft", offset: -5 }}
            tick={props => {
              const { x, y, payload } = props;
              return (
                <g transform={`translate(${x},${y})`}>
                  <text 
                    x={-10} 
                    y={0} 
                    dy={4} 
                    textAnchor="end" 
                    fill="#666"
                    style={{
                      fontSize: '12px',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden'
                    }}
                  >
                    {payload.value}
                  </text>
                </g>
              );
            }}
          />
          <Tooltip />
          <Legend wrapperStyle={{ position: 'relative', marginTop: '10px' }} />
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
            height={30}
            textAnchor={xAxisConfig.textAnchor}
            interval={xAxisConfig.interval}
            label={{ value: xAxis, position: "bottom", offset: 0 }}
          />
          <YAxis 
            domain={[85,100]} 
            label={{ value: yAxis, angle: -90, position: "insideLeft", offset: -5 }}
          />
          <Tooltip />
          <Legend wrapperStyle={{ position: 'relative', marginTop: '10px' }} />
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
          <PolarRadiusAxis domain={[85,100]} />
          <Tooltip />
          <Legend wrapperStyle={{ position: 'relative', marginTop: '10px' }} />
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

  // If we need a scrollable chart (for line and area with many data points)
  if ((chartType === "line" || chartType === "area") && useScrollableChart) {
    const minWidth = getMinWidth();
    
    return (
      <div className="chart-container" style={{ 
        width: "100%", 
        overflowX: "auto", 
        overflowY: "hidden",
        WebkitOverflowScrolling: "touch" // Smooth scrolling on iOS
      }}>
        <div style={{ 
          minWidth: minWidth + "px", 
          height: "400px" 
        }}>
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  // For other chart types or fewer data points, use standard responsive container
  return (
    <ResponsiveContainer width="100%" height={400}>
      {renderChart()}
    </ResponsiveContainer>
  );
};

export default GradeChart;