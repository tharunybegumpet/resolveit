import React, { useEffect, useState, useContext } from "react";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "/api/complaints";

function StaffDashboard() {
  const { auth, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [myComplaints, setMyComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [progressNote, setProgressNote] = useState("");
  const [userReply, setUserReply] = useState("");

  const loadMyComplaints = async () => {
    try {
      setLoading(true);
      setError("");

      console.log("🔄 Loading my assigned complaints...");
      const response = await api.get(`${API_BASE_URL}/my-assignments`);
      console.log("✅ My complaints:", response.data);
      setMyComplaints(Array.isArray(response.data) ? response.data : []);

    } catch (e) {
      console.error("❌ API Error:", e.response?.data || e.message);
      setError(`Failed to load: ${e.response?.status} ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMyComplaints();
  }, []);

  const updateStatus = async (complaintId, newStatus) => {
    try {
      console.log(`🔄 Updating complaint ${complaintId} to status ${newStatus}`);
      const response = await api.put(`${API_BASE_URL}/${complaintId}/staff-status`, {
        status: newStatus
      });
      console.log("✅ Status update response:", response.data);
      loadMyComplaints();
      alert(`✅ Complaint status updated to ${newStatus}!`);
    } catch (e) {
      console.error("❌ Status update error:", e.response?.data || e.message);
      alert(`❌ Status update failed: ${e.response?.data?.message || e.message}`);
    }
  };

  const addProgressNote = async () => {
    if (!selectedComplaint || !progressNote.trim()) return;
    try {
      await api.post(`${API_BASE_URL}/${selectedComplaint.id}/progress-note`, {
        note: progressNote,
      });
      setProgressNote("");
      alert("✅ Progress note added!");
    } catch (e) {
      alert("❌ Note failed");
    }
  };

  const replyToUser = async () => {
    if (!selectedComplaint || !userReply.trim()) return;
    try {
      await api.post(`${API_BASE_URL}/${selectedComplaint.id}/reply`, {
        reply: userReply,
      });
      setUserReply("");
      alert("✅ Reply sent to user!");
    } catch (e) {
      alert("❌ Reply failed");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="staff-dashboard" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '30px', borderBottom: '2px solid #007bff', paddingBottom: '15px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ color: '#007bff', margin: 0 }}>👨‍💼 Staff Dashboard</h1>
            <p style={{ color: '#666', margin: '5px 0 0 0' }}>
              Welcome, {auth.user?.name}! Here are your assigned complaints.
            </p>
          </div>
          <button 
            onClick={handleLogout}
            style={{
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            🚪 Logout
          </button>
        </div>
        <button 
          onClick={loadMyComplaints}
          style={{
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '10px',
            marginRight: '10px'
          }}
        >
          🔄 Refresh
        </button>
        <button 
          onClick={() => navigate('/complaint')}
          style={{
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '10px'
          }}
        >
          📝 Submit New Complaint
        </button>
      </header>

      {error && (
        <div style={{ 
          backgroundColor: '#f8d7da', 
          color: '#721c24', 
          padding: '15px', 
          borderRadius: '5px', 
          marginBottom: '20px',
          border: '1px solid #f5c6cb'
        }}>
          ❌ {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px', fontSize: '18px' }}>
          ⏳ Loading your assigned complaints...
        </div>
      ) : (
        <>
          <section>
            <h2 style={{ color: '#495057' }}>📋 My Assigned Complaints ({myComplaints.length})</h2>
            {myComplaints.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '50px', 
                backgroundColor: '#f8f9fa', 
                borderRadius: '8px',
                color: '#6c757d'
              }}>
                <h3>📭 No complaints assigned to you yet</h3>
                <p>Check back later or contact your admin.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
                {myComplaints.map((complaint) => (
                  <div key={complaint.id} style={{
                    border: '1px solid #dee2e6',
                    borderRadius: '8px',
                    padding: '20px',
                    backgroundColor: 'white',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}>
                    <div style={{ marginBottom: '15px' }}>
                      <h4 style={{ margin: '0 0 10px 0', color: '#495057' }}>
                        #{complaint.id}: {complaint.title || 'No Title'}
                      </h4>
                      <div style={{ 
                        padding: '5px 10px', 
                        borderRadius: '15px', 
                        fontSize: '12px', 
                        fontWeight: 'bold', 
                        display: 'inline-block',
                        backgroundColor: complaint.status === 'Resolved' ? '#d4edda' : 
                                       complaint.status === 'In Progress' ? '#fff3cd' : '#f8d7da',
                        color: complaint.status === 'Resolved' ? '#155724' : 
                               complaint.status === 'In Progress' ? '#856404' : '#721c24'
                      }}>
                        📊 Status: {complaint.status || 'New'}
                      </div>
                    </div>
                    
                    <p style={{ color: '#666', marginBottom: '15px' }}>
                      <strong>Description:</strong> {complaint.description || 'No description'}
                    </p>
                    
                    <p style={{ color: '#666', fontSize: '14px', marginBottom: '15px' }}>
                      <strong>Reported by:</strong> {complaint.raisedBy || 'Anonymous'} | 
                      <strong> Date:</strong> {complaint.createdAt}
                    </p>

                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => updateStatus(complaint.id, 'IN_PROGRESS')}
                        disabled={complaint.status === 'In Progress'}
                        style={{
                          backgroundColor: complaint.status === 'In Progress' ? '#6c757d' : '#ff9800',
                          color: 'white',
                          border: 'none',
                          padding: '8px 12px',
                          borderRadius: '4px',
                          cursor: complaint.status === 'In Progress' ? 'not-allowed' : 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        🔄 {complaint.status === 'In Progress' ? 'Working' : 'Start Work'}
                      </button>
                      <button
                        onClick={() => updateStatus(complaint.id, 'RESOLVED')}
                        disabled={complaint.status === 'Resolved'}
                        style={{
                          backgroundColor: complaint.status === 'Resolved' ? '#6c757d' : '#28a745',
                          color: 'white',
                          border: 'none',
                          padding: '8px 12px',
                          borderRadius: '4px',
                          cursor: complaint.status === 'Resolved' ? 'not-allowed' : 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        ✅ {complaint.status === 'Resolved' ? 'Resolved' : 'Mark Resolved'}
                      </button>
                      <button
                        onClick={() => setSelectedComplaint(complaint)}
                        style={{
                          backgroundColor: '#007bff',
                          color: 'white',
                          border: 'none',
                          padding: '8px 12px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        📝 Add Notes/Reply
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Complaint Details Modal */}
          {selectedComplaint && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000
            }}>
              <div style={{
                backgroundColor: 'white',
                padding: '30px',
                borderRadius: '8px',
                maxWidth: '600px',
                width: '90%',
                maxHeight: '80vh',
                overflow: 'auto'
              }}>
                <h3 style={{ marginTop: 0 }}>
                  #{selectedComplaint.id}: {selectedComplaint.title}
                </h3>
                
                <p><strong>Description:</strong> {selectedComplaint.description}</p>
                
                <div style={{ marginBottom: '20px' }}>
                  <h5>📝 Add Progress Note</h5>
                  <textarea
                    value={progressNote}
                    onChange={(e) => setProgressNote(e.target.value)}
                    placeholder="Document your progress on this complaint..."
                    rows={3}
                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                  />
                  <button 
                    onClick={addProgressNote}
                    style={{
                      backgroundColor: '#6c757d',
                      color: 'white',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      marginTop: '10px'
                    }}
                  >
                    Save Progress Note
                  </button>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <h5>💬 Reply to User</h5>
                  <textarea
                    value={userReply}
                    onChange={(e) => setUserReply(e.target.value)}
                    placeholder="Send an update to the user about their complaint..."
                    rows={3}
                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                  />
                  <button 
                    onClick={replyToUser}
                    style={{
                      backgroundColor: '#007bff',
                      color: 'white',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      marginTop: '10px'
                    }}
                  >
                    Send Reply to User
                  </button>
                </div>

                <button 
                  onClick={() => setSelectedComplaint(null)}
                  style={{
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  ❌ Close
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default StaffDashboard;