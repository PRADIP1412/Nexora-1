import React, { useState } from 'react';
import ReportChart from '../Common/ReportChart';
import { FaChartLine, FaChartBar, FaChartPie, FaExchangeAlt } from 'react-icons/fa';

const SalesCharts = ({
  dailyTrend = [],
  categorySales = [],
  brandSales = [],
  loading = false,
  onChartExport
}) => {
  const [activeChart, setActiveChart] = useState('trend');

  const charts = [
    { id: 'trend', label: 'Sales Trend', icon: <FaChartLine /> },
    { id: 'category', label: 'By Category', icon: <FaChartPie /> },
    { id: 'brand', label: 'By Brand', icon: <FaChartBar /> },
    { id: 'comparison', label: 'Comparison', icon: <FaExchangeAlt /> }
  ];

  const renderTrendChart = () => (
    <ReportChart
      title="Daily Sales Trend"
      data={dailyTrend}
      xAxisKey="date"
      yAxisKey="amount"
      type="line"
      height={400}
      loading={loading}
      onExport={() => onChartExport && onChartExport('trend')}
      showTypeSelector={true}
    />
  );

  const renderCategoryChart = () => (
    <ReportChart
      title="Sales by Category"
      data={categorySales}
      xAxisKey="category"
      yAxisKey="sales"
      type="doughnut"
      height={400}
      loading={loading}
      onExport={() => onChartExport && onChartExport('category')}
      showTypeSelector={true}
    />
  );

  const renderBrandChart = () => (
    <ReportChart
      title="Sales by Brand"
      data={brandSales}
      xAxisKey="brand"
      yAxisKey="sales"
      type="bar"
      height={400}
      loading={loading}
      onExport={() => onChartExport && onChartExport('brand')}
      showTypeSelector={true}
    />
  );

  const renderComparisonChart = () => {
    const comparisonData = categorySales.map(cat => ({
      label: cat.category,
      sales: cat.sales || 0,
      orders: cat.orders || 0,
      avg_order: cat.sales && cat.orders ? cat.sales / cat.orders : 0
    }));

    return (
      <ReportChart
        title="Category Comparison"
        data={comparisonData}
        xAxisKey="label"
        yAxisKey="sales"
        datasets={[
          { key: 'sales', label: 'Total Sales', backgroundColor: 'rgba(59, 130, 246, 0.5)' },
          { key: 'orders', label: 'Number of Orders', backgroundColor: 'rgba(16, 185, 129, 0.5)' },
          { key: 'avg_order', label: 'Avg Order Value', backgroundColor: 'rgba(245, 158, 11, 0.5)' }
        ]}
        type="bar"
        height={400}
        loading={loading}
        onExport={() => onChartExport && onChartExport('comparison')}
        showTypeSelector={false}
      />
    );
  };

  const renderChart = () => {
    switch (activeChart) {
      case 'trend':
        return renderTrendChart();
      case 'category':
        return renderCategoryChart();
      case 'brand':
        return renderBrandChart();
      case 'comparison':
        return renderComparisonChart();
      default:
        return renderTrendChart();
    }
  };

  return (
    <div className="space-y-6">
      {/* Chart Navigation */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">Sales Visualizations</h3>
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {charts.map((chart) => (
            <button
              key={chart.id}
              onClick={() => setActiveChart(chart.id)}
              className={`flex items-center px-3 py-2 rounded-md transition-colors ${
                activeChart === chart.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="mr-2">{chart.icon}</span>
              {chart.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Display */}
      {renderChart()}
    </div>
  );
};

export default SalesCharts;