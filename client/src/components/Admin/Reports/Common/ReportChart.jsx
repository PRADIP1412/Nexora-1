import React, { useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler, // Import Filler plugin
} from 'chart.js';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import { FaChartLine, FaChartBar, FaChartPie, FaDownload, FaExclamationTriangle } from 'react-icons/fa';

// Register all Chart.js components including Filler
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler // Register the Filler plugin
);

const ReportChart = ({
  data = [],
  type = 'line',
  title = '',
  xAxisKey = 'label',
  yAxisKey = 'value',
  datasets = [],
  height = 400,
  options = {},
  loading = false,
  error = null,
  onExport,
  className = '',
  showTypeSelector = true,
  emptyMessage = 'No data available', // Add emptyMessage prop
}) => {
  const [chartType, setChartType] = React.useState(type);
  const chartRef = useRef();

  const chartTypes = [
    { id: 'line', label: 'Line', icon: <FaChartLine /> },
    { id: 'bar', label: 'Bar', icon: <FaChartBar /> },
    { id: 'pie', label: 'Pie', icon: <FaChartPie /> },
    { id: 'doughnut', label: 'Doughnut', icon: <FaChartPie /> },
  ];

  const prepareChartData = () => {
    if (datasets.length > 0) {
      return {
        labels: data.map(item => item[xAxisKey] || ''),
        datasets: datasets.map((dataset, index) => ({
          label: dataset.label,
          data: data.map(item => item[dataset.key] || 0),
          backgroundColor: dataset.backgroundColor || 
            `hsl(${index * 60}, 70%, 50%, 0.7)`,
          borderColor: dataset.borderColor || 
            `hsl(${index * 60}, 70%, 40%)`,
          borderWidth: dataset.borderWidth || 2,
          fill: dataset.fill || false,
          tension: dataset.tension || 0.1, // Add tension for smoother lines
        }))
      };
    }

    // Single dataset
    return {
      labels: data.map(item => item[xAxisKey] || ''),
      datasets: [{
        label: title,
        data: data.map(item => item[yAxisKey] || 0),
        backgroundColor: chartType === 'pie' || chartType === 'doughnut' 
          ? data.map((_, i) => `hsl(${i * 360 / Math.max(data.length, 1)}, 70%, 50%, 0.7)`)
          : 'rgba(59, 130, 246, 0.5)',
        borderColor: chartType === 'pie' || chartType === 'doughnut'
          ? data.map((_, i) => `hsl(${i * 360 / Math.max(data.length, 1)}, 70%, 40%)`)
          : 'rgb(59, 130, 246)',
        borderWidth: 2,
        fill: chartType === 'line' ? {
          target: 'origin',
          above: 'rgba(59, 130, 246, 0.1)',
        } : false,
        tension: chartType === 'line' ? 0.1 : 0, // Add tension for line charts
      }]
    };
  };

  // Default chart options
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        display: chartType === 'pie' || chartType === 'doughnut' || datasets.length > 0,
      },
      title: {
        display: !!title,
        text: title,
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: { size: 12 },
        bodyFont: { size: 12 },
        padding: 10,
      },
    },
    scales: (chartType === 'line' || chartType === 'bar') ? {
      y: {
        beginAtZero: true,
        grid: {
          drawBorder: false,
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          callback: function(value) {
            if (Math.abs(value) >= 1000000) {
              return '$' + (value/1000000).toFixed(1) + 'M';
            }
            if (Math.abs(value) >= 1000) {
              return '$' + (value/1000).toFixed(1) + 'k';
            }
            return '$' + value;
          }
        }
      },
      x: {
        grid: {
          display: false,
        },
      },
    } : undefined,
  };

  // Merge custom options with defaults
  const chartOptions = {
    ...defaultOptions,
    ...options,
  };

  // Add fill configuration specifically for line charts
  if (chartType === 'line') {
    chartOptions.plugins = {
      ...chartOptions.plugins,
      filler: {
        propagate: true
      }
    };
  }

  const handleExport = () => {
    if (chartRef.current && onExport) {
      const chartCanvas = chartRef.current.canvas;
      const url = chartCanvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = url;
      link.download = `${title || 'chart'}_${new Date().toISOString().split('T')[0]}.png`;
      link.click();
    } else if (chartRef.current) {
      // Fallback if onExport not provided
      const chartCanvas = chartRef.current.canvas;
      const url = chartCanvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = url;
      link.download = `${title || 'chart'}_${new Date().toISOString().split('T')[0]}.png`;
      link.click();
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-pulse">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
        </div>
        <div className="p-6" style={{ height: `${height}px` }}>
          <div className="h-full bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        </div>
        <div className="p-8 text-center" style={{ height: `${height}px` }}>
          <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mb-3">
            <FaExclamationTriangle className="text-red-600 text-xl" />
          </div>
          <h4 className="text-lg font-medium text-gray-800 mb-2">Chart Error</h4>
          <p className="text-gray-600 text-sm">
            {typeof error === 'string' ? error : 'Failed to load chart data'}
          </p>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        </div>
        <div className="p-8 text-center" style={{ height: `${height}px` }}>
          <div className="text-gray-400 text-4xl mb-3">📈</div>
          <h4 className="text-lg font-medium text-gray-600 mb-2">No Chart Data</h4>
          <p className="text-gray-500 text-sm">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  const chartData = prepareChartData();

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden ${className}`}>
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        
        <div className="flex items-center space-x-3">
          {showTypeSelector && (
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
              {chartTypes.map((typeItem) => (
                <button
                  key={typeItem.id}
                  onClick={() => setChartType(typeItem.id)}
                  className={`p-2 rounded-md transition-colors ${
                    chartType === typeItem.id
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                  title={typeItem.label}
                >
                  {typeItem.icon}
                </button>
              ))}
            </div>
          )}
          
          <button
            onClick={handleExport}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
            title="Export as PNG"
          >
            <FaDownload />
          </button>
        </div>
      </div>
      
      <div className="p-4" style={{ height: `${height}px` }}>
        {chartType === 'line' && (
          <Line 
            ref={chartRef} 
            data={chartData} 
            options={chartOptions} 
            plugins={[{
              id: 'customPlugin',
              beforeDraw: (chart) => {
                // Custom drawing logic if needed
              }
            }]}
          />
        )}
        {chartType === 'bar' && (
          <Bar ref={chartRef} data={chartData} options={chartOptions} />
        )}
        {chartType === 'pie' && (
          <Pie ref={chartRef} data={chartData} options={chartOptions} />
        )}
        {chartType === 'doughnut' && (
          <Doughnut ref={chartRef} data={chartData} options={chartOptions} />
        )}
      </div>
    </div>
  );
};

export default ReportChart;