import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import './EarningsChart.css';

Chart.register(...registerables);

const EarningsChart = ({ chartData, loading, activeFilter, onFilterChange }) => {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    useEffect(() => {
        if (!chartRef.current || !chartData || !chartData.labels || !chartData.datasets) return;

        // Destroy previous chart instance
        if (chartInstance.current) {
            chartInstance.current.destroy();
        }

        const ctx = chartRef.current.getContext('2d');
        
        // Prepare data
        const labels = Array.isArray(chartData.labels) ? chartData.labels : [];
        const dataset = chartData.datasets && chartData.datasets[0] ? chartData.datasets[0] : { data: [] };
        
        chartInstance.current = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Daily Earnings (₹)',
                    data: Array.isArray(dataset.data) ? dataset.data : [],
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: function(context) {
                                return `₹${context.parsed.y}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#6b7280'
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            borderDash: [5, 5]
                        },
                        ticks: {
                            color: '#6b7280',
                            callback: function(value) {
                                return '₹' + value;
                            }
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'nearest'
                }
            }
        });

        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
        };
    }, [chartData]);

    if (loading && !chartData) {
        return (
            <div className="chart-card">
                <div className="chart-header">
                    <h3>Earnings Trend</h3>
                    <div className="chart-filters">
                        <button className="chart-filter-btn active">7 Days</button>
                        <button className="chart-filter-btn">30 Days</button>
                        <button className="chart-filter-btn">This Month</button>
                    </div>
                </div>
                <div className="chart-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading chart data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="chart-card">
            <div className="chart-header">
                <h3>Earnings Trend</h3>
                <div className="chart-filters">
                    <button 
                        className={`chart-filter-btn ${activeFilter === '7 Days' ? 'active' : ''}`}
                        onClick={() => onFilterChange('7 Days')}
                    >
                        7 Days
                    </button>
                    <button 
                        className={`chart-filter-btn ${activeFilter === '30 Days' ? 'active' : ''}`}
                        onClick={() => onFilterChange('30 Days')}
                    >
                        30 Days
                    </button>
                    <button 
                        className={`chart-filter-btn ${activeFilter === 'This Month' ? 'active' : ''}`}
                        onClick={() => onFilterChange('This Month')}
                    >
                        This Month
                    </button>
                </div>
            </div>
            <div className="chart-container">
                <canvas ref={chartRef}></canvas>
            </div>
        </div>
    );
};

export default EarningsChart;