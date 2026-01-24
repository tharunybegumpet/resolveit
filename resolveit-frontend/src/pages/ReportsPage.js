import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement,
    Filler
} from 'chart.js';
import { Bar, Pie, Line, Doughnut } from 'react-chartjs-2';
import './ReportsPage.css';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement,
    Filler
);

function ReportsPage() {
    const navigate = useNavigate();
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [exportFormat, setExportFormat] = useState('CSV');

    const categories = [
        'Maintenance',
        'Technical Issues',
        'Transport',
        'Facilities',
        'Safety & Security',
        'Administrative',
        'Other'
    ];

    useEffect(() => {
        // Set default date range (last 30 days)
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 30);
        
        setDateRange({
            start: start.toISOString().split('T')[0],
            end: end.toISOString().split('T')[0]
        });
    }, []);

    const handleCategoryToggle = (category) => {
        if (selectedCategories.includes(category)) {
            setSelectedCategories(selectedCategories.filter(c => c !== category));
        } else {
            setSelectedCategories([...selectedCategories, category]);
        }
    };

    const generateReport = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8080/api/reports/generate', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    startDate: dateRange.start,
                    endDate: dateRange.end,
                    categories: selectedCategories.length > 0 ? selectedCategories : categories
                })
            });

            if (response.ok) {
                const data = await response.json();
                setReportData(data);
            } else {
                // Fallback to sample data for demo purposes
                console.log('Using sample data for demo');
                setReportData(generateSampleData());
            }
        } catch (error) {
            console.error('Error generating report:', error);
            // Fallback to sample data for demo purposes
            console.log('Using sample data for demo');
            setReportData(generateSampleData());
        } finally {
            setLoading(false);
        }
    };

    const generateSampleData = () => ({
        totalComplaints: 156,
        resolvedComplaints: 98,
        pendingComplaints: 58,
        resolutionRate: 63,
        categoryBreakdown: [
            { category: 'Technical Issues', count: 45 },
            { category: 'Maintenance', count: 32 },
            { category: 'Transport', count: 28 },
            { category: 'Facilities', count: 22 },
            { category: 'Safety & Security', count: 18 },
            { category: 'Administrative', count: 11 }
        ],
        statusBreakdown: [
            { status: 'Resolved', count: 98 },
            { status: 'In Progress', count: 35 },
            { status: 'Open', count: 23 }
        ],
        priorityBreakdown: [42, 78, 36],
        monthlyTrend: {
            new: [12, 19, 15, 25, 22, 30, 28, 35, 32, 40, 38, 45],
            resolved: [8, 15, 12, 20, 18, 25, 24, 30, 28, 35, 33, 40]
        },
        avgResolutionDays: 3.2,
        topCategory: 'Technical Issues',
        staffCount: 12
    });

    const exportReport = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:8080/api/reports/export?format=${exportFormat}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    startDate: dateRange.start,
                    endDate: dateRange.end,
                    categories: selectedCategories.length > 0 ? selectedCategories : categories
                })
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `complaint_report_${dateRange.start}_to_${dateRange.end}.${exportFormat.toLowerCase()}`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            } else {
                alert('Failed to export report');
            }
        } catch (error) {
            console.error('Error exporting report:', error);
            alert('Error exporting report');
        }
    };

    // Chart configurations and data
    const getChartColors = () => ({
        primary: ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#8b5a2b', '#6b7280'],
        gradients: [
            'rgba(99, 102, 241, 0.8)',
            'rgba(139, 92, 246, 0.8)',
            'rgba(236, 72, 153, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(16, 185, 129, 0.8)',
            'rgba(6, 182, 212, 0.8)',
            'rgba(139, 90, 43, 0.8)',
            'rgba(107, 114, 128, 0.8)'
        ]
    });

    const categoryPieData = reportData ? {
        labels: reportData.categoryBreakdown?.map(item => item.category) || [],
        datasets: [{
            data: reportData.categoryBreakdown?.map(item => item.count) || [],
            backgroundColor: getChartColors().primary,
            borderColor: '#ffffff',
            borderWidth: 3,
            hoverOffset: 10
        }]
    } : null;

    const statusDoughnutData = reportData ? {
        labels: reportData.statusBreakdown?.map(item => item.status) || [],
        datasets: [{
            data: reportData.statusBreakdown?.map(item => item.count) || [],
            backgroundColor: getChartColors().gradients,
            borderColor: '#ffffff',
            borderWidth: 3,
            cutout: '60%'
        }]
    } : null;

    const monthlyTrendData = reportData ? {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
            {
                label: 'New Complaints',
                data: reportData.monthlyTrend?.new || [12, 19, 15, 25, 22, 30, 28, 35, 32, 40, 38, 45],
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#6366f1',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 3,
                pointRadius: 6
            },
            {
                label: 'Resolved Complaints',
                data: reportData.monthlyTrend?.resolved || [8, 15, 12, 20, 18, 25, 24, 30, 28, 35, 33, 40],
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#10b981',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 3,
                pointRadius: 6
            }
        ]
    } : null;

    const priorityBarData = reportData ? {
        labels: ['High Priority', 'Medium Priority', 'Low Priority'],
        datasets: [{
            label: 'Complaints by Priority',
            data: reportData.priorityBreakdown || [25, 45, 30],
            backgroundColor: [
                'rgba(239, 68, 68, 0.8)',
                'rgba(245, 158, 11, 0.8)',
                'rgba(34, 197, 94, 0.8)'
            ],
            borderColor: [
                '#ef4444',
                '#f59e0b',
                '#22c55e'
            ],
            borderWidth: 2,
            borderRadius: 8,
            borderSkipped: false
        }]
    } : null;

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    padding: 20,
                    usePointStyle: true,
                    font: {
                        size: 12,
                        weight: '600'
                    }
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: '#ffffff',
                bodyColor: '#ffffff',
                borderColor: '#6366f1',
                borderWidth: 1,
                cornerRadius: 8,
                displayColors: true
            }
        }
    };

    const lineChartOptions = {
        ...chartOptions,
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.1)'
                },
                ticks: {
                    font: {
                        size: 11
                    }
                }
            },
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    font: {
                        size: 11
                    }
                }
            }
        }
    };

    const barChartOptions = {
        ...chartOptions,
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.1)'
                }
            },
            x: {
                grid: {
                    display: false
                }
            }
        }
    };

    return (
        <div className="reports-page">
            <div className="reports-header">
                <button className="back-button" onClick={() => navigate(-1)}>
                    ← Back
                </button>
                <h1>📊 Reports & Exports</h1>
            </div>

            <div className="reports-container">
                <div className="report-parameters">
                    <h2>Report Parameters</h2>

                    <div className="parameter-group">
                        <label>Date Range</label>
                        <div className="date-inputs">
                            <input
                                type="date"
                                value={dateRange.start}
                                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                            />
                            <span>to</span>
                            <input
                                type="date"
                                value={dateRange.end}
                                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="parameter-group">
                        <label>Complaint Categories</label>
                        <div className="category-checkboxes">
                            {categories.map(category => (
                                <label key={category} className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={selectedCategories.includes(category)}
                                        onChange={() => handleCategoryToggle(category)}
                                    />
                                    {category}
                                </label>
                            ))}
                        </div>
                        <button 
                            className="select-all-btn"
                            onClick={() => setSelectedCategories(selectedCategories.length === categories.length ? [] : categories)}
                        >
                            {selectedCategories.length === categories.length ? 'Deselect All' : 'Select All'}
                        </button>
                    </div>

                    <div className="parameter-group">
                        <label>Export Options</label>
                        <div className="export-format">
                            <button
                                className={`format-btn ${exportFormat === 'CSV' ? 'active' : ''}`}
                                onClick={() => setExportFormat('CSV')}
                            >
                                CSV
                            </button>
                            <button
                                className={`format-btn ${exportFormat === 'PDF' ? 'active' : ''}`}
                                onClick={() => setExportFormat('PDF')}
                            >
                                PDF
                            </button>
                        </div>
                    </div>

                    <button 
                        className="generate-report-btn"
                        onClick={generateReport}
                        disabled={loading}
                    >
                        {loading ? 'Generating...' : 'Generate Report'}
                    </button>
                </div>

                {reportData && (
                    <div className="report-results">
                        <div className="results-header">
                            <h2>Report Results</h2>
                            <button className="export-btn" onClick={exportReport}>
                                📥 Export as {exportFormat}
                            </button>
                        </div>

                        <div className="stats-cards">
                            <div className="stat-card">
                                <div className="stat-icon">📋</div>
                                <div className="stat-value">{reportData.totalComplaints}</div>
                                <div className="stat-label">Total Complaints</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">✅</div>
                                <div className="stat-value">{reportData.resolvedComplaints}</div>
                                <div className="stat-label">Resolved</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">⏳</div>
                                <div className="stat-value">{reportData.pendingComplaints}</div>
                                <div className="stat-label">Pending</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">📈</div>
                                <div className="stat-value">{reportData.resolutionRate}%</div>
                                <div className="stat-label">Resolution Rate</div>
                            </div>
                        </div>

                        <div className="charts-section">
                            {/* Pie Chart - Complaints by Category */}
                            <div className="chart-card">
                                <h3>📊 Complaints by Category</h3>
                                <div className="chart-container">
                                    {categoryPieData && (
                                        <Pie 
                                            data={categoryPieData} 
                                            options={chartOptions}
                                        />
                                    )}
                                </div>
                            </div>

                            {/* Doughnut Chart - Status Distribution */}
                            <div className="chart-card">
                                <h3>🎯 Status Distribution</h3>
                                <div className="chart-container">
                                    {statusDoughnutData && (
                                        <Doughnut 
                                            data={statusDoughnutData} 
                                            options={chartOptions}
                                        />
                                    )}
                                </div>
                            </div>

                            {/* Line Chart - Monthly Trends */}
                            <div className="chart-card chart-wide">
                                <h3>📈 Monthly Trends</h3>
                                <div className="chart-container">
                                    {monthlyTrendData && (
                                        <Line 
                                            data={monthlyTrendData} 
                                            options={lineChartOptions}
                                        />
                                    )}
                                </div>
                            </div>

                            {/* Bar Chart - Priority Distribution */}
                            <div className="chart-card">
                                <h3>⚡ Priority Distribution</h3>
                                <div className="chart-container">
                                    {priorityBarData && (
                                        <Bar 
                                            data={priorityBarData} 
                                            options={barChartOptions}
                                        />
                                    )}
                                </div>
                            </div>

                            {/* Legacy Category Chart (Fallback) */}
                            <div className="chart-card legacy-chart">
                                <h3>📋 Category Breakdown (Detailed)</h3>
                                <div className="category-chart">
                                    {reportData.categoryBreakdown && reportData.categoryBreakdown.map(item => (
                                        <div key={item.category} className="category-bar">
                                            <div className="category-name">{item.category}</div>
                                            <div className="bar-container">
                                                <div 
                                                    className="bar-fill" 
                                                    style={{ width: `${(item.count / reportData.totalComplaints) * 100}%` }}
                                                ></div>
                                            </div>
                                            <div className="category-count">{item.count}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Status Summary Card */}
                            <div className="chart-card status-summary">
                                <h3>📋 Status Summary</h3>
                                <div className="status-chart">
                                    {reportData.statusBreakdown && reportData.statusBreakdown.map((item, index) => (
                                        <div key={item.status} className="status-item">
                                            <div className="status-indicator" style={{backgroundColor: getChartColors().primary[index]}}></div>
                                            <div className="status-details">
                                                <div className="status-label">{item.status}</div>
                                                <div className="status-stats">
                                                    <span className="status-count">{item.count}</span>
                                                    <span className="status-percentage">
                                                        ({((item.count / reportData.totalComplaints) * 100).toFixed(1)}%)
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="trends-section">
                            <h3>Trends Over Time</h3>
                            <div className="trend-info">
                                <p>📊 Average Resolution Time: <strong>{reportData.avgResolutionDays} days</strong></p>
                                <p>📈 Most Common Category: <strong>{reportData.topCategory}</strong></p>
                                <p>👥 Total Staff Assigned: <strong>{reportData.staffCount}</strong></p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ReportsPage;
