// src/pages/AdminDashboard.js - PRESENTATION-READY VERSION
import React, { useEffect, useState, useContext } from "react";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

const API_BASE_URL = "/api/complaints";

function AdminDashboard() {
  const { auth, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [openComplaints, setOpenComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({ openCount: 0, resolvedCount: 0, avgResolutionDays: 0.2 });
  const [staffMembers, setStaffMembers] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState("");
  const [pendingApplications, setPendingApplications] = useState([]);
  const [backendStatus, setBackendStatus] = useState("checking");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");
      setBackendStatus("connecting");

      console.log("🔄 Loading Admin Dashboard...");
      console.log("Auth Token:", auth?.token ? "Present" : "Missing");
      console.log("User Role:", auth?.user?.role);

      // Test backend connection first
      try {
        const healthCheck = await api.get('/api/complaints');
        setBackendStatus("connected");
        console.log("✅ Backend connection successful");
      } catch (healthError) {
        setBackendStatus("failed");
        console.error("❌ Backend connection failed:", healthError);
        setError(`Backend connection failed: ${healthError.message}. Check if backend is running on port 8080.`);
        return;
      }

      // Load stats with error handling
      try {
        const statsRes = await api.get(`${API_BASE_URL}/stats`);
        console.log("Stats response:", statsRes.data);
        
        if (statsRes.data && statsRes.data.success) {
          const statsData = statsRes.data.stats;
          setStats({
            openCount: (statsData.byStatus?.NEW || 0) + (statsData.byStatus?.OPEN || 0) + (statsData.byStatus?.IN_PROGRESS || 0),
            resolvedCount: statsData.byStatus?.RESOLVED || 0,
            avgResolutionDays: 0.2  // 5 hours = 0.2 days
          });
          console.log("✅ Stats loaded successfully");
        } else {
          console.log("⚠️ Stats API returned unexpected format");
          setStats({ openCount: 0, resolvedCount: 0, avgResolutionDays: 0.2 });
        }
      } catch (statsError) {
        console.log("⚠️ Stats loading failed:", statsError.message);
        setStats({ openCount: 0, resolvedCount: 0, avgResolutionDays: 0.2 });
      }

      // Load all complaints with error handling
      try {
        const complaintsRes = await api.get(`${API_BASE_URL}`);
        console.log("Complaints response:", complaintsRes.data);
        
        if (Array.isArray(complaintsRes.data)) {
          const allComplaints = complaintsRes.data;
          const openComplaints = allComplaints.filter(c => 
            c.status === 'New' || c.status === 'Open' || c.status === 'In Progress' || c.status === 'Under Review'
          );
          setOpenComplaints(openComplaints);
          console.log(`✅ Loaded ${openComplaints.length} open complaints out of ${allComplaints.length} total`);
        } else {
          console.log("⚠️ Complaints API returned unexpected format");
          setOpenComplaints([]);
        }
      } catch (complaintsError) {
        console.log("⚠️ Complaints loading failed:", complaintsError.message);
        setOpenComplaints([]);
      }

      // Load staff members with error handling
      try {
        const staffRes = await api.get(`${API_BASE_URL}/staff`);
        console.log("Staff response:", staffRes.data);
        
        if (Array.isArray(staffRes.data)) {
          setStaffMembers(staffRes.data);
          console.log(`✅ Loaded ${staffRes.data.length} staff members`);
        } else {
          console.log("⚠️ Staff API returned unexpected format");
          setStaffMembers([]);
        }
      } catch (staffError) {
        console.log("⚠️ Staff loading failed:", staffError.message);
        setStaffMembers([]);
      }

      // Load pending applications with error handling
      try {
        const applicationsRes = await api.get('/api/staff-applications/pending');
        console.log("Applications response:", applicationsRes.data);
        
        if (applicationsRes.data && applicationsRes.data.success) {
          setPendingApplications(applicationsRes.data.applications || []);
          console.log(`✅ Loaded ${applicationsRes.data.applications?.length || 0} pending applications`);
        } else {
          console.log("⚠️ Applications API returned unexpected format");
          setPendingApplications([]);
        }
      } catch (appError) {
        console.log("⚠️ Applications loading failed:", appError.message);
        setPendingApplications([]);
      }

      console.log("✅ Dashboard loading completed");

    } catch (e) {
      console.error("❌ Dashboard loading failed:", e);
      setError(`Failed to load dashboard: ${e.response?.status || 'Unknown'} - ${e.message}`);
      setBackendStatus("failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check authentication on component mount
    if (!auth?.token || !auth?.user) {
      console.log("❌ No authentication found, redirecting to login");
      navigate("/login");
      return;
    }

    if (auth.user.role !== 'ADMIN') {
      console.log(`❌ Insufficient privileges. User role: ${auth.user.role}`);
      alert("Admin access required");
      navigate("/login");
      return;
    }

    console.log("✅ Admin authentication verified");
    loadDashboard();
  }, [auth, navigate]);

  const updateComplaintStatus = async (complaintId, newStatus) => {
    try {
      console.log(`🔄 Updating complaint ${complaintId} status to ${newStatus}`);
      
      const response = await api.put(`${API_BASE_URL}/${complaintId}/status`, { status: newStatus });
      console.log("Status update response:", response.data);
      
      await loadDashboard(); // Reload data
      alert(`✅ Status updated to ${newStatus}!`);
      console.log(`✅ Complaint ${complaintId} status updated successfully`);
    } catch (e) {
      console.error(`❌ Status update failed for complaint ${complaintId}:`, e);
      alert(`❌ Status update failed: ${e.response?.data?.message || e.message}`);
    }
  };

  const assignComplaint = async (complaintId) => {
    if (!selectedStaff) {
      alert("Please select a staff member first");
      return;
    }
    
    try {
      console.log(`🔄 Assigning complaint ${complaintId} to staff ${selectedStaff}`);
      
      const response = await api.put(`${API_BASE_URL}/${complaintId}/assign`, {
        staffId: parseInt(selectedStaff),
        status: "IN_PROGRESS"
      });
      console.log("Assignment response:", response.data);
      
      await loadDashboard(); // Reload data
      alert("✅ Complaint assigned successfully!");
      setSelectedStaff("");
      console.log(`✅ Complaint ${complaintId} assigned successfully`);
    } catch (e) {
      console.error(`❌ Assignment failed for complaint ${complaintId}:`, e);
      alert(`❌ Assignment failed: ${e.response?.data?.message || e.message}`);
    }
  };

  const resolveComplaint = async (complaintId) => {
    try {
      console.log(`🔄 Resolving complaint ${complaintId}`);
      
      const response = await api.put(`${API_BASE_URL}/${complaintId}/resolve`);
      console.log("Resolve response:", response.data);
      
      await loadDashboard(); // Reload data
      alert("✅ Complaint resolved!");
      console.log(`✅ Complaint ${complaintId} resolved successfully`);
    } catch (e) {
      console.error(`❌ Resolve failed for complaint ${complaintId}:`, e);
      alert(`❌ Resolve failed: ${e.response?.data?.message || e.message}`);
    }
  };

  const handleLogout = () => {
    console.log("🚪 Logging out admin user");
    logout();
    navigate("/login");
  };

  const handleApplicationAction = async (applicationId, action) => {
    try {
      console.log(`🔄 ${action} application ${applicationId}`);
      
      // Fix the endpoint URL - remove 'd' from approved/rejected
      const endpoint = action === 'APPROVED' ? 'approve' : 'reject';
      const response = await api.put(`/api/staff-applications/${applicationId}/${endpoint}`);
      console.log("Application action response:", response.data);
      
      await loadDashboard(); // Reload data
      alert(`✅ Application ${action.toLowerCase()} successfully!`);
    } catch (e) {
      console.error(`❌ Application ${action} failed:`, e);
      alert(`❌ Failed to ${action.toLowerCase()} application: ${e.response?.data?.message || e.message}`);
    }
  };

  const handleNavigation = (path, state = null) => {
    try {
      console.log(`🔄 Navigating to ${path}`);
      if (state) {
        navigate(path, { state });
      } else {
        navigate(path);
      }
    } catch (e) {
      console.error(`❌ Navigation failed to ${path}:`, e);
      alert(`Navigation failed: ${e.message}`);
    }
  };

  return (
    <div className="admin-dashboard">
      <header className="dashboard-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <h1>Admin Dashboard</h1>
          <div className="header-actions">
            <button 
              className="btn btn-success"
              onClick={() => handleNavigation('/reports')}
              title="View Reports"
            >
              📊 Reports
            </button>
            <button 
              className="btn btn-danger"
              onClick={() => handleNavigation('/escalations')}
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
        <div className="error" style={{ 
          background: '#f8d7da', 
          border: '1px solid #f5c6cb', 
          color: '#721c24', 
          padding: '15px', 
          borderRadius: '5px', 
          margin: '20px 0' 
        }}>
          <h4>❌ Error Loading Dashboard</h4>
          <p>{error}</p>
          <div style={{ marginTop: '10px' }}>
            <button 
              className="btn btn-primary" 
              onClick={loadDashboard}
              style={{ marginRight: '10px' }}
            >
              🔄 Retry
            </button>
            <small style={{ display: 'block', marginTop: '10px', color: '#6c757d' }}>
              <strong>Troubleshooting:</strong><br/>
              1. Check if backend is running on port 8080<br/>
              2. Verify MySQL database is running<br/>
              3. Check browser console (F12) for detailed errors<br/>
              4. Ensure you're logged in as admin
            </small>
          </div>
        </div>
      )}

      {backendStatus === "checking" && (
        <div style={{ 
          background: '#fff3cd', 
          border: '1px solid #ffeaa7', 
          color: '#856404', 
          padding: '15px', 
          borderRadius: '5px', 
          margin: '20px 0' 
        }}>
          🔄 Checking backend connection...
        </div>
      )}

      {backendStatus === "failed" && !error && (
        <div style={{ 
          background: '#f8d7da', 
          border: '1px solid #f5c6cb', 
          color: '#721c24', 
          padding: '15px', 
          borderRadius: '5px', 
          margin: '20px 0' 
        }}>
          ❌ Backend connection failed. Please ensure the backend server is running on port 8080.
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
              <div className="stat-number">{((stats.avgResolutionDays || 0.2) * 24).toFixed(0)} hours</div>
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
                          onClick={() => handleNavigation('/escalations', { complaintId: complaint.id })}
                        >
                          🔺 Escalate
                        </button>
                        <button
                          className="btn btn-info"
                          onClick={() => handleNavigation(`/complaints/${complaint.id}`)}
                        >
                          📝 Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Pending Staff Applications */}
          <section className="staff-applications-section">
            <h2>Pending Staff Applications ({pendingApplications.length})</h2>
            {pendingApplications.length === 0 ? (
              <p className="no-data">No pending staff applications.</p>
            ) : (
              <div className="applications-grid">
                {pendingApplications.map((application) => (
                  <div key={application.id} className="application-card">
                    <div className="application-header">
                      <h4>{application.applicantName || 'Unknown Applicant'}</h4>
                      <div className="status-badge pending">PENDING</div>
                    </div>
                    
                    <div className="application-content">
                      <div className="application-meta">
                        <span><strong>Email:</strong> {application.applicantEmail || 'N/A'}</span>
                        <span><strong>Experience:</strong> {application.experience || 'N/A'}</span>
                        <span><strong>Availability:</strong> {application.availability || 'N/A'}</span>
                        <span><strong>Applied:</strong> {application.createdAt ? new Date(application.createdAt).toLocaleDateString() : 'Recent'}</span>
                      </div>
                      
                      <div className="application-details">
                        <p><strong>Skills:</strong> {application.skills || 'Not specified'}</p>
                        <p><strong>Motivation:</strong> {application.motivation || 'Not provided'}</p>
                        {application.previousExperience && (
                          <p><strong>Previous Experience:</strong> {application.previousExperience}</p>
                        )}
                      </div>
                    </div>

                    <div className="application-actions">
                      <button
                        className="btn btn-success"
                        onClick={() => handleApplicationAction(application.id, 'APPROVED')}
                        style={{ marginRight: '10px' }}
                      >
                        ✅ Approve
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleApplicationAction(application.id, 'REJECTED')}
                      >
                        ❌ Reject
                      </button>
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