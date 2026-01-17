import React, { useEffect, useState, useContext } from "react";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";

const EscalationPage = () => {
  const { auth, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  
  const [myEscalations, setMyEscalations] = useState([]);
  const [authorities, setAuthorities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Escalation form state
  const [showEscalationForm, setShowEscalationForm] = useState(false);
  const [escalationForm, setEscalationForm] = useState({
    complaintId: "",
    escalatedToId: "",
    reason: ""
  });
  
  // Available complaints for escalation
  const [availableComplaints, setAvailableComplaints] = useState([]);

  useEffect(() => {
    // Check if complaint ID was passed from AdminDashboard
    if (location.state?.complaintId) {
      setEscalationForm(prev => ({
        ...prev,
        complaintId: location.state.complaintId.toString()
      }));
      setShowEscalationForm(true);
      console.log(`✅ Auto-selected complaint ID: ${location.state.complaintId}`);
    }
    
    loadEscalationData();
  }, [location.state]);

  const loadEscalationData = async () => {
    try {
      setLoading(true);
      setError("");

      // Load my escalations
      try {
        const escalationsRes = await api.get("/api/escalations/my-escalations");
        setMyEscalations(escalationsRes.data.escalations || []);
      } catch (escalationError) {
        console.log("ℹ️ No escalations found or endpoint not available");
        setMyEscalations([]);
      }

      // Load available authorities
      try {
        const authoritiesRes = await api.get("/api/escalations/authorities");
        setAuthorities(authoritiesRes.data.authorities || []);
      } catch (authError) {
        console.log("ℹ️ No authorities found or endpoint not available");
        setAuthorities([]);
      }

      // Load all complaints and filter for open ones
      try {
        const complaintsRes = await api.get("/api/complaints");
        if (Array.isArray(complaintsRes.data)) {
          const openComplaints = complaintsRes.data.filter(c => 
            c.status === 'New' || c.status === 'Open' || c.status === 'In Progress' || c.status === 'Under Review'
          );
          setAvailableComplaints(openComplaints);
        } else {
          setAvailableComplaints([]);
        }
      } catch (complaintsError) {
        console.log("ℹ️ No complaints found");
        setAvailableComplaints([]);
      }

    } catch (e) {
      console.error("❌ API Error:", e.response?.data || e.message);
      setError(`Failed to load escalation data: ${e.response?.status} ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEscalateComplaint = async (e) => {
    e.preventDefault();
    
    if (!escalationForm.complaintId || !escalationForm.escalatedToId || !escalationForm.reason.trim()) {
      alert("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      
      await api.post("/api/escalations/escalate", {
        complaintId: parseInt(escalationForm.complaintId),
        escalatedToId: parseInt(escalationForm.escalatedToId),
        reason: escalationForm.reason
      });

      alert("✅ Complaint escalated successfully!");
      
      // Reset form and reload data
      setEscalationForm({ complaintId: "", escalatedToId: "", reason: "" });
      setShowEscalationForm(false);
      loadEscalationData();

    } catch (e) {
      console.error("❌ Escalation Error:", e.response?.data || e.message);
      alert(`❌ Escalation failed: ${e.response?.data?.message || e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleResolveEscalation = async (escalationId) => {
    if (!window.confirm("Are you sure you want to resolve this escalation?")) {
      return;
    }

    try {
      await api.put(`/api/escalations/${escalationId}/resolve`);
      alert("✅ Escalation resolved successfully!");
      loadEscalationData();
    } catch (e) {
      console.error("❌ Resolve Error:", e.response?.data || e.message);
      alert(`❌ Failed to resolve escalation: ${e.response?.data?.message || e.message}`);
    }
  };

  const triggerAutoEscalation = async () => {
    if (!window.confirm("This will automatically escalate all eligible unresolved complaints. Continue?")) {
      return;
    }

    try {
      setLoading(true);
      const response = await api.post("/api/escalations/auto-escalate");
      alert(`✅ Auto-escalation completed! ${response.data.escalatedCount} complaints escalated.`);
      loadEscalationData();
    } catch (e) {
      console.error("❌ Auto-escalation Error:", e.response?.data || e.message);
      alert(`❌ Auto-escalation failed: ${e.response?.data?.message || e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const sendReminders = async () => {
    try {
      setLoading(true);
      await api.post("/api/escalations/send-reminders");
      alert("✅ Escalation reminders sent successfully!");
    } catch (e) {
      console.error("❌ Reminders Error:", e.response?.data || e.message);
      alert(`❌ Failed to send reminders: ${e.response?.data?.message || e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return "N/A";
    return new Date(dateTimeString).toLocaleString();
  };

  const getEscalationTypeColor = (type) => {
    switch (type) {
      case "MANUAL": return "#007bff";
      case "AUTOMATIC": return "#28a745";
      case "PRIORITY": return "#dc3545";
      default: return "#6c757d";
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        marginBottom: "30px",
        borderBottom: "2px solid #e9ecef",
        paddingBottom: "15px"
      }}>
        <h1 style={{ color: "#343a40", margin: 0 }}>🔺 Escalation Management</h1>
        <div style={{ display: "flex", gap: "10px" }}>
          <button 
            onClick={() => navigate("/admin-dashboard")}
            style={{
              backgroundColor: "#6c757d",
              color: "white",
              border: "none",
              padding: "10px 20px",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px"
            }}
          >
            ← Back to Dashboard
          </button>
          <button 
            onClick={loadEscalationData}
            style={{
              backgroundColor: "#17a2b8",
              color: "white",
              border: "none",
              padding: "10px 20px",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px"
            }}
          >
            🔄 Refresh
          </button>
          <button 
            onClick={handleLogout}
            style={{
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
              padding: "10px 20px",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px"
            }}
          >
            🚪 Logout
          </button>
        </div>
      </div>

      {error && (
        <div style={{
          backgroundColor: "#f8d7da",
          color: "#721c24",
          padding: "15px",
          borderRadius: "6px",
          marginBottom: "20px",
          border: "1px solid #f5c6cb"
        }}>
          ❌ {error}
        </div>
      )}

      {loading && (
        <div style={{
          backgroundColor: "#d1ecf1",
          color: "#0c5460",
          padding: "15px",
          borderRadius: "6px",
          marginBottom: "20px",
          textAlign: "center"
        }}>
          ⏳ Loading...
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ 
        display: "flex", 
        gap: "15px", 
        marginBottom: "30px",
        flexWrap: "wrap"
      }}>
        <button
          onClick={() => setShowEscalationForm(!showEscalationForm)}
          style={{
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            padding: "12px 24px",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: "bold"
          }}
        >
          🔺 {showEscalationForm ? "Cancel" : "Escalate Complaint"}
        </button>
        
        {auth?.user?.role === "ADMIN" && (
          <>
            <button
              onClick={triggerAutoEscalation}
              style={{
                backgroundColor: "#28a745",
                color: "white",
                border: "none",
                padding: "12px 24px",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "16px"
              }}
            >
              🤖 Auto-Escalate
            </button>
            
            <button
              onClick={sendReminders}
              style={{
                backgroundColor: "#ffc107",
                color: "#212529",
                border: "none",
                padding: "12px 24px",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "16px"
              }}
            >
              📧 Send Reminders
            </button>
          </>
        )}
      </div>

      {/* Escalation Form */}
      {showEscalationForm && (
        <div style={{
          backgroundColor: "#f8f9fa",
          padding: "25px",
          borderRadius: "8px",
          marginBottom: "30px",
          border: "1px solid #dee2e6"
        }}>
          <h3 style={{ marginTop: 0, color: "#495057" }}>🔺 Escalate Complaint</h3>
          <form onSubmit={handleEscalateComplaint}>
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>
                Select Complaint:
                {location.state?.complaintId && (
                  <span style={{ 
                    color: "#28a745", 
                    fontSize: "12px", 
                    marginLeft: "10px",
                    background: "#d4edda",
                    padding: "2px 8px",
                    borderRadius: "3px"
                  }}>
                    ✅ Pre-selected from Admin Dashboard
                  </span>
                )}
              </label>
              <select
                value={escalationForm.complaintId}
                onChange={(e) => setEscalationForm({...escalationForm, complaintId: e.target.value})}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "4px",
                  border: location.state?.complaintId ? "2px solid #28a745" : "1px solid #ced4da",
                  fontSize: "14px",
                  background: location.state?.complaintId ? "#f8fff9" : "white"
                }}
                required
              >
                <option value="">Choose a complaint to escalate...</option>
                {availableComplaints.map((complaint) => (
                  <option key={complaint.id} value={complaint.id}>
                    #{complaint.id} - {complaint.title} (Status: {complaint.status})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>
                Escalate To:
              </label>
              <select
                value={escalationForm.escalatedToId}
                onChange={(e) => setEscalationForm({...escalationForm, escalatedToId: e.target.value})}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "4px",
                  border: "1px solid #ced4da",
                  fontSize: "14px"
                }}
                required
              >
                <option value="">Select higher authority...</option>
                {authorities.map((authority) => (
                  <option key={authority.id} value={authority.id}>
                    {authority.name} ({authority.role}) - {authority.email}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>
                Escalation Reason:
              </label>
              <textarea
                value={escalationForm.reason}
                onChange={(e) => setEscalationForm({...escalationForm, reason: e.target.value})}
                placeholder="Explain why this complaint needs to be escalated..."
                rows={4}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "4px",
                  border: "1px solid #ced4da",
                  fontSize: "14px",
                  resize: "vertical"
                }}
                required
              />
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  backgroundColor: "#dc3545",
                  color: "white",
                  border: "none",
                  padding: "12px 24px",
                  borderRadius: "6px",
                  cursor: loading ? "not-allowed" : "pointer",
                  fontSize: "16px",
                  fontWeight: "bold"
                }}
              >
                {loading ? "⏳ Escalating..." : "🔺 Escalate Now"}
              </button>
              
              <button
                type="button"
                onClick={() => setShowEscalationForm(false)}
                style={{
                  backgroundColor: "#6c757d",
                  color: "white",
                  border: "none",
                  padding: "12px 24px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "16px"
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* My Escalations */}
      <div>
        <h2 style={{ color: "#495057", marginBottom: "20px" }}>
          📋 My Escalations ({myEscalations.length})
        </h2>
        
        {myEscalations.length === 0 ? (
          <div style={{
            backgroundColor: "#e2e3e5",
            color: "#383d41",
            padding: "20px",
            borderRadius: "6px",
            textAlign: "center"
          }}>
            No escalations assigned to you yet.
          </div>
        ) : (
          <div style={{ display: "grid", gap: "20px" }}>
            {myEscalations.map((escalation) => (
              <div
                key={escalation.id}
                style={{
                  backgroundColor: "white",
                  border: "1px solid #dee2e6",
                  borderRadius: "8px",
                  padding: "20px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "15px" }}>
                  <div>
                    <h4 style={{ margin: "0 0 10px 0", color: "#343a40" }}>
                      🔺 Escalation #{escalation.id}
                    </h4>
                    <div style={{
                      display: "inline-block",
                      backgroundColor: getEscalationTypeColor(escalation.escalationType),
                      color: "white",
                      padding: "4px 12px",
                      borderRadius: "12px",
                      fontSize: "12px",
                      fontWeight: "bold"
                    }}>
                      {escalation.escalationType}
                    </div>
                  </div>
                  
                  <div style={{
                    backgroundColor: escalation.isActive ? "#d4edda" : "#f8d7da",
                    color: escalation.isActive ? "#155724" : "#721c24",
                    padding: "6px 12px",
                    borderRadius: "12px",
                    fontSize: "12px",
                    fontWeight: "bold"
                  }}>
                    {escalation.isActive ? "🟢 ACTIVE" : "🔴 RESOLVED"}
                  </div>
                </div>

                {/* Complaint Details */}
                <div style={{
                  backgroundColor: "#f8f9fa",
                  padding: "15px",
                  borderRadius: "6px",
                  marginBottom: "15px"
                }}>
                  <h5 style={{ margin: "0 0 10px 0", color: "#495057" }}>
                    📋 Complaint: #{escalation.complaint.id}
                  </h5>
                  <p style={{ margin: "0 0 8px 0", fontWeight: "bold" }}>
                    {escalation.complaint.title}
                  </p>
                  <p style={{ margin: 0, color: "#6c757d", fontSize: "14px" }}>
                    {escalation.complaint.description}
                  </p>
                </div>

                {/* Escalation Details */}
                <div style={{ marginBottom: "15px" }}>
                  <p style={{ margin: "0 0 8px 0" }}>
                    <strong>Reason:</strong> {escalation.escalationReason}
                  </p>
                  <p style={{ margin: "0 0 8px 0" }}>
                    <strong>Escalated by:</strong> {escalation.escalatedBy.name}
                  </p>
                  <p style={{ margin: "0 0 8px 0" }}>
                    <strong>Created:</strong> {formatDateTime(escalation.createdAt)}
                  </p>
                  {escalation.resolvedAt && (
                    <p style={{ margin: "0 0 8px 0" }}>
                      <strong>Resolved:</strong> {formatDateTime(escalation.resolvedAt)}
                    </p>
                  )}
                </div>

                {/* Actions */}
                {escalation.isActive && (
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button
                      onClick={() => handleResolveEscalation(escalation.id)}
                      style={{
                        backgroundColor: "#28a745",
                        color: "white",
                        border: "none",
                        padding: "8px 16px",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "14px"
                      }}
                    >
                      ✅ Resolve Escalation
                    </button>
                    
                    <button
                      onClick={() => navigate(`/complaint-details/${escalation.complaint.id}`)}
                      style={{
                        backgroundColor: "#007bff",
                        color: "white",
                        border: "none",
                        padding: "8px 16px",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "14px"
                      }}
                    >
                      📝 View Complaint
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EscalationPage;