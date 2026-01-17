import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function UserDashboard() {
  const { auth, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showStaffApplication, setShowStaffApplication] = useState(false);
  const [myApplications, setMyApplications] = useState([]);
  const [staffApplication, setStaffApplication] = useState({
    categories: [],
    experience: '',
    skills: '',
    availability: '',
    motivation: '',
    previousExperience: ''
  });

  const complaintCategories = [
    'Maintenance',
    'Technical Issues',
    'Transport',
    'Facilities',
    'Safety & Security',
    'Administrative',
    'Other'
  ];

  const getCategoryEmoji = (category) => {
    const emojiMap = {
      'Maintenance': '🔧',
      'Technical Issues': '💻',
      'Transport': '🚗',
      'Facilities': '🏢',
      'Safety & Security': '🛡️',
      'Administrative': '📋',
      'Other': '📌'
    };
    return emojiMap[category] || '📌';
  };

  useEffect(() => {
    fetchMyApplications();
  }, []);

  const fetchMyApplications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/staff-applications/my-applications', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setMyApplications(data.applications);
        }
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  const handleStaffApplicationSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const applicationData = {
        ...staffApplication,
        categories: JSON.stringify(staffApplication.categories)
      };
      
      const response = await fetch('http://localhost:8080/api/staff-applications/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(applicationData)
      });

      if (response.ok) {
        alert('Staff application submitted successfully!');
        setStaffApplication({
          categories: [],
          experience: '',
          skills: '',
          availability: '',
          motivation: '',
          previousExperience: ''
        });
        setShowStaffApplication(false);
        fetchMyApplications();
      } else {
        const errorData = await response.json();
        alert('Error: ' + errorData.message);
      }
    } catch (error) {
      alert('Error submitting application: ' + error.message);
    }
  };

  const handleCategoryChange = (category) => {
    setStaffApplication(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getApplicationStatus = () => {
    if (myApplications.length === 0) return null;
    const latestApp = myApplications[0];
    return latestApp.status;
  };

  const canApplyForStaff = () => {
    const status = getApplicationStatus();
    return status !== 'PENDING' && status !== 'APPROVED';
  };

  return (
    <div className="user-dashboard" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '30px', borderBottom: '2px solid #007bff', paddingBottom: '15px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ color: '#007bff', margin: 0 }}>👤 User Dashboard</h1>
            <p style={{ color: '#666', margin: '5px 0 0 0' }}>
              Welcome, {auth.user?.name}! Submit and track your complaints.
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
      </header>

      {/* Staff Application Section */}
      <div style={{
        backgroundColor: '#f8f9fa',
        padding: '25px',
        borderRadius: '12px',
        marginBottom: '30px',
        border: '1px solid #dee2e6'
      }}>
        <h3 style={{ color: '#495057', marginBottom: '15px' }}>🎯 Become a Staff Member</h3>
        
        {getApplicationStatus() === 'PENDING' && (
          <div style={{ backgroundColor: '#fff3cd', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #ffeaa7' }}>
            <strong>⏳ Application Status: PENDING</strong>
            <p style={{ margin: '5px 0 0 0' }}>Your staff application is under review by the admin.</p>
          </div>
        )}
        
        {getApplicationStatus() === 'APPROVED' && (
          <div style={{ backgroundColor: '#d4edda', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #c3e6cb' }}>
            <strong>✅ Application Status: APPROVED</strong>
            <p style={{ margin: '5px 0 0 0' }}>Congratulations! You are now a staff member. Please refresh the page.</p>
          </div>
        )}
        
        {getApplicationStatus() === 'REJECTED' && (
          <div style={{ backgroundColor: '#f8d7da', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #f5c6cb' }}>
            <strong>❌ Application Status: REJECTED</strong>
            <p style={{ margin: '5px 0 0 0' }}>Your previous application was rejected. You can apply again.</p>
          </div>
        )}
        
        <p style={{ color: '#666', marginBottom: '20px' }}>
          Join our team and help resolve complaints! Staff members can handle specific categories of complaints based on their expertise.
        </p>
        
        {canApplyForStaff() && (
          <button 
            onClick={() => setShowStaffApplication(true)}
            style={{ 
              padding: '15px 30px', 
              backgroundColor: '#28a745', 
              color: 'white', 
              border: 'none', 
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            🚀 Apply to Become Staff
          </button>
        )}
      </div>

      {/* Staff Application Form Modal */}
      {showStaffApplication && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.5)', 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          zIndex: 1000 
        }}>
          <div style={{ 
            backgroundColor: 'white', 
            padding: '30px', 
            borderRadius: '12px', 
            maxWidth: '700px', 
            width: '90%', 
            maxHeight: '90%', 
            overflow: 'auto' 
          }}>
            <h3 style={{ marginBottom: '20px', color: '#495057' }}>📋 Staff Application Form</h3>
            <form onSubmit={handleStaffApplicationSubmit}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#495057' }}>
                  What categories of complaints can you handle? (Select all that apply)
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                  {complaintCategories.map(category => (
                    <label key={category} style={{ display: 'flex', alignItems: 'center', padding: '8px', backgroundColor: '#f8f9fa', borderRadius: '6px', cursor: 'pointer', border: staffApplication.categories.includes(category) ? '2px solid #007bff' : '1px solid #dee2e6' }}>
                      <input
                        type="checkbox"
                        checked={staffApplication.categories.includes(category)}
                        onChange={() => handleCategoryChange(category)}
                        style={{ marginRight: '8px', cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: '14px' }}>{getCategoryEmoji(category)} {category}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#495057' }}>
                  Years of Experience in Customer Service/Support:
                </label>
                <select
                  value={staffApplication.experience}
                  onChange={(e) => setStaffApplication(prev => ({ ...prev, experience: e.target.value }))}
                  required
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}
                >
                  <option value="">Select experience level</option>
                  <option value="0-1 years">0-1 years</option>
                  <option value="1-3 years">1-3 years</option>
                  <option value="3-5 years">3-5 years</option>
                  <option value="5+ years">5+ years</option>
                </select>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#495057' }}>
                  Technical Skills (comma-separated):
                </label>
                <input
                  type="text"
                  value={staffApplication.skills}
                  onChange={(e) => setStaffApplication(prev => ({ ...prev, skills: e.target.value }))}
                  placeholder="e.g., Communication, Problem-solving, Technical troubleshooting"
                  required
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#495057' }}>
                  Availability:
                </label>
                <select
                  value={staffApplication.availability}
                  onChange={(e) => setStaffApplication(prev => ({ ...prev, availability: e.target.value }))}
                  required
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}
                >
                  <option value="">Select availability</option>
                  <option value="Full-time (40+ hours/week)">Full-time (40+ hours/week)</option>
                  <option value="Part-time (20-40 hours/week)">Part-time (20-40 hours/week)</option>
                  <option value="Flexible (10-20 hours/week)">Flexible (10-20 hours/week)</option>
                  <option value="Weekend only">Weekend only</option>
                </select>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#495057' }}>
                  Why do you want to become a staff member?
                </label>
                <textarea
                  value={staffApplication.motivation}
                  onChange={(e) => setStaffApplication(prev => ({ ...prev, motivation: e.target.value }))}
                  placeholder="Explain your motivation and what you can contribute..."
                  required
                  rows="4"
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#495057' }}>
                  Previous Experience (Optional):
                </label>
                <textarea
                  value={staffApplication.previousExperience}
                  onChange={(e) => setStaffApplication(prev => ({ ...prev, previousExperience: e.target.value }))}
                  placeholder="Describe any relevant previous experience..."
                  rows="3"
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  type="submit"
                  style={{ 
                    padding: '12px 24px', 
                    backgroundColor: '#007bff', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  Submit Application
                </button>
                <button 
                  type="button"
                  onClick={() => setShowStaffApplication(false)}
                  style={{ 
                    padding: '12px 24px', 
                    backgroundColor: '#6c757d', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        
        {/* Submit New Complaint Card */}
        <div style={{
          border: '1px solid #dee2e6',
          borderRadius: '12px',
          padding: '30px',
          backgroundColor: 'white',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '15px' }}>📝</div>
          <h3 style={{ color: '#495057', marginBottom: '15px' }}>Submit New Complaint</h3>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            Report an issue or concern that needs attention
          </p>
          <button
            onClick={() => navigate('/complaint')}
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              width: '100%'
            }}
          >
            📝 Submit Complaint
          </button>
        </div>

        {/* Track Complaints Card */}
        <div style={{
          border: '1px solid #dee2e6',
          borderRadius: '12px',
          padding: '30px',
          backgroundColor: 'white',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '15px' }}>🔍</div>
          <h3 style={{ color: '#495057', marginBottom: '15px' }}>Track Complaints</h3>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            Check the status of your submitted complaints
          </p>
          <button
            onClick={() => navigate('/track')}
            style={{
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              width: '100%'
            }}
          >
            🔍 Track Status
          </button>
        </div>

      </div>

      {/* Quick Info Section */}
      <div style={{
        backgroundColor: '#f8f9fa',
        padding: '20px',
        borderRadius: '8px',
        border: '1px solid #dee2e6'
      }}>
        <h4 style={{ color: '#495057', marginBottom: '15px' }}>📋 How it Works</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
          <div>
            <strong>1. Submit</strong>
            <p style={{ margin: '5px 0', color: '#666' }}>Fill out the complaint form with details</p>
          </div>
          <div>
            <strong>2. Track</strong>
            <p style={{ margin: '5px 0', color: '#666' }}>Monitor progress with your complaint ID</p>
          </div>
          <div>
            <strong>3. Resolve</strong>
            <p style={{ margin: '5px 0', color: '#666' }}>Get updates until your issue is resolved</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#e9ecef', borderRadius: '6px' }}>
        <h5 style={{ margin: '0 0 10px 0', color: '#495057' }}>👤 Account Information</h5>
        <p style={{ margin: '5px 0', color: '#666' }}>
          <strong>Name:</strong> {auth.user?.name} | 
          <strong> Email:</strong> {auth.user?.email} | 
          <strong> Role:</strong> {auth.user?.role}
        </p>
      </div>
    </div>
  );
}

export default UserDashboard;