import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ReportsPage.css';

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
                alert('Failed to generate report');
            }
        } catch (error) {
            console.error('Error generating report:', error);
            alert('Error generating report');
        } finally {
            setLoading(false);
        }
    };

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
                            <div className="chart-card">
                                <h3>Complaints by Category</h3>
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

                            <div className="chart-card">
                                <h3>Complaints by Status</h3>
                                <div className="status-chart">
                                    {reportData.statusBreakdown && reportData.statusBreakdown.map(item => (
                                        <div key={item.status} className="status-item">
                                            <div className="status-label">{item.status}</div>
                                            <div className="status-count">{item.count}</div>
                                            <div className="status-percentage">
                                                ({((item.count / reportData.totalComplaints) * 100).toFixed(1)}%)
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
