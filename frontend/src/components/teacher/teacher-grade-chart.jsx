import React from "react";
import {
  LineChart,
  BarChart,
  AreaChart,
  Line,
  Bar,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Label,
} from "recharts";

// Color palette moved outside component to avoid recreation on each render
const COLORS = [
  "#1E40AF", "#3B82F6", "#93C5FD", "#BFDBFE", 
  "#047857", "#10B981", "#6EE7B7", "#A7F3D0",
  "#B45309", "#F59E0B", "#FCD34D", "#FEF3C7",
  "#B91C1C", "#EF4444", "#FCA5A5", "#FEE2E2",
  "#6D28D9", "#8B5CF6", "#C4B5FD", "#EDE9FE",
  "#BE185D", "#EC4899", "#F9A8D4", "#FCE7F3",
  "#0F766E", "#14B8A6", "#5EEAD4", "#CCFBF1",
  "#4338CA", "#6366F1", "#A5B4FC", "#E0E7FF"
];

// Helper functions moved outside to avoid recreation on each render
const getColor = (index) => {
  const step = 4;
  return COLORS[(index * step) % COLORS.length];
};

const getYAxisDomain = (data, dataKeys) => {
  if (!data || !dataKeys.length) return [0, 100];
  
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

// Function to get chart axis labels based on data type and quarter selection
const getChartAxisLabels = (selectedDataType, selectedQuarter) => {
  // Default labels
  let xAxisLabel = "";
  let yAxisLabel = "";

  // Case 1: Single Section Performance with All Quarters
  if (selectedDataType === "singleSectionPerformance" && selectedQuarter === "all") {
    xAxisLabel = "Quarters";
    yAxisLabel = "Grade Value";
  }
  // Case 2: Single Section Performance with Specific Quarter
  else if (selectedDataType === "singleSectionPerformance" && selectedQuarter !== "all") {
    xAxisLabel = "Student Names";
    yAxisLabel = "Grade Values";
  }
  // Case 3: Sections Performance with All Quarters
  else if (selectedDataType === "sectionsPerformance") {
    xAxisLabel = "Section Names";
    yAxisLabel = "Grade Value";
  }

  return { xAxisLabel, yAxisLabel };
};

const LEGEND_STYLE = {
  position: 'relative',
  whiteSpace: 'nowrap',
  overflowX: 'auto',
  maxWidth: '100%'
};

const TeacherGradeChart = ({ chartType, data, dataType, selectedDataType, selectedQuarter }) => {
  if (!data || data.length === 0) return null;

  // Get keys for chart (exclude 'name' which is used for x-axis)
  const dataKeys = Object.keys(data[0]).filter(key => key !== "name");
  
  const useAngledLabels = data.length > 8;
  const hideEveryNthLabel = Math.ceil(data.length / 12);
  
  // Get appropriate axis labels based on data type and quarter
  const { xAxisLabel, yAxisLabel } = getChartAxisLabels(selectedDataType, selectedQuarter);
  
  // Adjust margins to accommodate axis labels
  const chartMargin = useAngledLabels
    ? { top: 10, right: 30, left: 60, bottom: 100 }  // Increased left margin for Y-axis label
    : { top: 10, right: 30, left: 60, bottom: 50 };  // Increased left margin for Y-axis label

  const xAxisProps = useAngledLabels 
    ? {
        angle: -45,
        textAnchor: "end",
        height: 70,
        interval: 0,
        tickFormatter: (value, index) => index % hideEveryNthLabel === 0 ? value : "",
        dy: 10
      }
    : { interval: 0 };

  const yAxisDomain = getYAxisDomain(data, dataKeys);

  const renderChart = () => {
    switch (chartType) {
      case "line":
        return (
          <LineChart data={data} margin={chartMargin}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              {...xAxisProps} 
              label={{
                value: xAxisLabel, 
                position: "insideBottomRight", 
                offset: -10
              }} 
            />
            <YAxis 
              domain={yAxisDomain}
            >
              <Label
                value={yAxisLabel}
                position="insideLeft"
                angle={-90}
                style={{ textAnchor: 'middle' }}
                dx={-20}
              />
            </YAxis>
            <Tooltip />
            <Legend wrapperStyle={LEGEND_STYLE} />
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
          <BarChart 
            layout="vertical" 
            data={data} 
            margin={{...chartMargin, left: 60, right: 30}}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              type="number" 
              domain={yAxisDomain}
              label={{
                value: yAxisLabel, 
                position: "insideBottom", 
                offset: -5
              }}
            />
            <YAxis 
              type="category"
              dataKey="name" 
              width={150}
              tick={{fontSize: 12}}
              interval={0}
            >
              <Label
                value={xAxisLabel}
                position="insideLeft"
                angle={-90}
                style={{ textAnchor: 'middle' }}
                dx={-20}
              />
            </YAxis>
            <Tooltip />
            <Legend wrapperStyle={LEGEND_STYLE} />
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
              {...xAxisProps}
              label={{
                value: xAxisLabel, 
                position: "insideBottomRight", 
                offset: -10
              }}
            />
            <YAxis domain={yAxisDomain}>
              <Label
                value={yAxisLabel}
                position="insideLeft"
                angle={-90}
                style={{ textAnchor: 'middle' }}
                dx={-20}
              />
            </YAxis>
            <Tooltip />
            <Legend wrapperStyle={LEGEND_STYLE} />
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
      
      default:
        return null;
    }
  };

  const chartHeight = chartType === "bar" ? (data.length * 50 > 400 ? data.length * 50 : 400) : 400;
  
  return (
    <ResponsiveContainer className="sm:w-full md:w-2/3 lg:w-1/2" height={chartHeight}>
      {renderChart()}
    </ResponsiveContainer>
  );
};

export default TeacherGradeChart;