// src/pages/AdminDashboard.js - CLEAN FIXED VERSION
import React, { useEffect, useState, useContext } from "react";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

const API_BASE_URL = "/api/complaints";

function AdminDashboard() {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [openComplaints, setOpenComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({ openCount: 0, resolvedCount: 0, avgResolutionDays: 0 });
  const [staffMembers, setStaffMembers] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState("");
  const [pendingApplications, setPendingApplications] = useState([]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      // Load stats
      try {
        const statsRes = await api.get(`${API_BASE_URL}/stats`);
        if (statsRes.data.success) {
          const stats = statsRes.data.stats;
          setStats({
            openCount: (stats.byStatus?.NEW || 0) + (stats.byStatus?.OPEN || 0) + (stats.byStatus?.IN_PROGRESS || 0),
            resolvedCount: stats.byStatus?.RESOLVED || 0,
            avgResolutionDays: 0
          });
        }
      } catch (statsError) {
        console.log("Stats error:", statsError.message);
      }

      // Load all complaints
      try {
        const complaintsRes = await api.get(`${API_BASE_URL}`);
        if (Array.isArray(complaintsRes.data)) {
          const openComplaints = complaintsRes.data.filter(c => 
            c.status === 'New' || c.status === 'Open' || c.status === 'In Progress' || c.status === 'Under Review'
          );
          setOpenComplaints(openComplaints);
        }
      } catch (complaintsError) {
        console.log("Complaints error:", complaintsError.message);
      }

      // Load staff members
      try {
        const staffRes = await api.get(`${API_BASE_URL}/staff`);
        setStaffMembers(Array.isArray(staffRes.data) ? staffRes.data : []);
      } catch (staffError) {
        console.log("Staff error:", staffError.message);
        setStaffMembers([]);
      }

      // Load pending applications
      try {
        const applicationsRes = await api.get('/api/staff-applications/pending');
        if (applicationsRes.data.success) {
          setPendingApplications(applicationsRes.data.applications || []);
        }
      } catch (appError) {
        setPendingApplications([]);
      }

    } catch (e) {
      setError(`Failed to load: ${e.response?.status} ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const updateComplaintStatus = async (complaintId, newStatus) => {
    try {
      await api.put(`${API_BASE_URL}/${complaintId}/status`, { status: newStatus });
      loadDashboard();
      alert(`✅ Status updated to ${newStatus}!`);
    } catch (e) {
      alert("❌ Status update failed");
    }
  };

  const assignComplaint = async (complaintId) => {
    if (!selectedStaff) {
      alert("Please select a staff member first");
      return;
    }
    
    try {
      await api.put(`${API_BASE_URL}/${complaintId}/assign`, {
        staffId: selectedStaff,
        status: "IN_PROGRESS"
      });
      loadDashboard();
      alert("✅ Complaint assigned successfully!");
      setSelectedStaff("");
    } catch (e) {
      alert("❌ Assignment failed");
    }
  };

  const resolveComplaint = async (complaintId) => {
    try {
      await api.put(`${API_BASE_URL}/${complaintId}/resolve`);
      loadDashboard();
      alert("✅ Complaint resolved!");
    } catch (e) {
      alert("❌ Resolve failed");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="admin-dashboard">
      <header className="dashboard-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <h1>Admin Dashboard</h1>
          <div className="header-actions">
            <button 
              className="btn btn-success"
              onClick={() => navigate('/reports')}
              title="View Reports"
            >
              📊 Reports
            </button>
            <button 
              className="btn btn-danger"
              onClick={() => navigate('/escalations')}
              title="Manage Escalations"
            >
              🔺 Escalations
            </button>
            <button 
              className="btn btn-primary"
              onClick={loadDashboard}
              title="Refresh Dashboard"
              disabled={loading}
            >
              {loading ? '⏳' : '🔄'} Refresh
            </button>
            <button 
              className="btn btn-secondary"
              onClick={handleLogout}
              title="Logout"
            >
              🚪 Logout
            </button>
          </div>
        </div>
      </header>

      {error && (
        <div className="error">
          ❌ {error}
          <br />
          <small>Check F12 Console for details. Backend: http://localhost:8080</small>
        </div>
      )}

      {loading ? (
        <div className="loading">⏳ Loading dashboard...</div>
      ) : (
        <>
          {/* Stats */}
          <section className="stats-overview">
            <div className="stat-card open">
              <h3>Open</h3>
              <div className="stat-number">{stats.openCount || 0}</div>
            </div>
            <div className="stat-card resolved">
              <h3>Resolved</h3>
              <div className="stat-number">{stats.resolvedCount || 0}</div>
            </div>
            <div className="stat-card avg-time">
              <h3>Avg Resolution</h3>
              <div className="stat-number">{(stats.avgResolutionDays || 0).toFixed(1)} days</div>
            </div>
            <div className="stat-card pending-apps">
              <h3>Pending Applications</h3>
              <div className="stat-number">{pendingApplications.length}</div>
            </div>
          </section>

          {/* Open Complaints */}
          <section className="complaints-section">
            <h2>Open Complaints ({openComplaints.length})</h2>
            {openComplaints.length === 0 ? (
              <p className="no-data">No open complaints. Submit one to test!</p>
            ) : (
              <div className="complaints-grid">
                {openComplaints.map((complaint) => (
                  <div key={complaint.id} className="complaint-card open">
                    <div className="complaint-header">
                      <h4>{complaint.title || 'No Title'}</h4>
                      <div className="priority-badge">{complaint.priority || 'MEDIUM'}</div>
                    </div>
                    
                    <div className="complaint-content">
                      <p>{complaint.description || 'No description available'}</p>
                      
                      <div className="complaint-meta">
                        <span>By: {complaint.raisedBy || 'Unknown'}</span>
                        <span>{complaint.createdAt ? new Date(complaint.createdAt).toLocaleDateString() : 'Recent'}</span>
                        {complaint.assignedTo && (
                          <span style={{ color: '#28a745', fontWeight: 'bold' }}>
                            👤 Assigned to: {complaint.assignedTo.name}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="complaint-actions">
                      {/* Assignment Section */}
                      <div className="assign-section">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                          <select
                            value={selectedStaff}
                            onChange={(e) => setSelectedStaff(e.target.value)}
                            style={{ 
                              padding: '8px 12px', 
                              borderRadius: '6px',
                              border: '1px solid #ced4da',
                              backgroundColor: 'white',
                              minWidth: '150px'
                            }}
                          >
                            <option value="">Select Staff</option>
                            {staffMembers.map((staff) => (
                              <option key={staff.id} value={staff.id}>
                                {staff.name}
                              </option>
                            ))}
                          </select>
                          <button
                            className="btn btn-primary"
                            onClick={() => assignComplaint(complaint.id)}
                            disabled={!selectedStaff}
                            style={{ opacity: selectedStaff ? 1 : 0.6 }}
                          >
                            👤 Assign
                          </button>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="action-buttons">
                        <button
                          className="btn btn-warning"
                          onClick={() => updateComplaintStatus(complaint.id, 'IN_PROGRESS')}
                        >
                          🔄 In Progress
                        </button>
                        <button
                          className="btn btn-secondary"
                          onClick={() => updateComplaintStatus(complaint.id, 'NEW')}
                        >
                          🔄 Reset to New
                        </button>
                        <button
                          className="btn btn-success"
                          onClick={() => resolveComplaint(complaint.id)}
                        >
                          ✅ Resolve
                        </button>
                        <button
                          className="btn btn-danger"
                          onClick={() => navigate('/escalations', { state: { complaintId: complaint.id } })}
                        >
                          🔺 Escalate
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

export default AdminDashboard;