import { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Badge, ProgressBar, Card, Button, Alert } from 'react-bootstrap';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const ComplaintDetails = () => {
  const { id } = useParams();
  const { auth } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [complaint, setComplaint] = useState(null);
  const [files, setFiles] = useState([]);
  const [filesLoading, setFilesLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // FETCH REAL DATA FROM BACKEND API
  useEffect(() => {
    const fetchComplaintDetails = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Use the configured API service with authentication
        const response = await api.get(`/api/complaints/${id}`);
        
        if (response.data) {
          const complaintData = response.data;
          
          // Convert backend data to frontend format
          const status = getStatusFromBackend(complaintData.status);
          const progress = getProgressFromStatus(status);
          
          setComplaint({
            id: complaintData.id,
            title: complaintData.title,
            description: complaintData.description,
            category: complaintData.category,
            status: status,
            progress: progress,
            raisedBy: complaintData.raisedBy,
            createdAt: complaintData.createdAt,
            assignedTo: complaintData.assignedTo,
            anonymous: complaintData.anonymous,
            timeline: generateTimeline(complaintData, status)
          });
        } else {
          setError('No complaint data received');
        }
      } catch (err) {
        console.error('Error fetching complaint:', err);
        if (err.response?.status === 404) {
          setError(`Complaint #${id} not found`);
        } else {
          setError(err.response?.data?.message || 'Failed to load complaint details');
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchComplaintDetails();
    }
  }, [id]);

  // Fetch files for the complaint
  useEffect(() => {
    const fetchComplaintFiles = async () => {
      if (!auth.token || !id) return;
      
      setFilesLoading(true);
      try {
        const response = await api.get(`/api/complaints/${id}/files`);
        if (response.data.success) {
          setFiles(response.data.files || []);
          setIsAdmin(response.data.isAdmin || false);
        }
      } catch (err) {
        console.error('Error fetching files:', err);
      } finally {
        setFilesLoading(false);
      }
    };

    fetchComplaintFiles();
  }, [id, auth.token]);

  // Convert backend status to frontend status
  const getStatusFromBackend = (backendStatus) => {
    switch (backendStatus?.toLowerCase()) {
      case 'new':
        return 'UNDER_REVIEW';
      case 'open':
      case 'in progress':
        return 'IN_PROGRESS';
      case 'resolved':
      case 'closed':
        return 'RESOLVED';
      case 'escalated':
        return 'ESCALATED';
      default:
        return 'UNDER_REVIEW';
    }
  };

  // Get progress percentage based on status
  const getProgressFromStatus = (status) => {
    switch (status) {
      case 'UNDER_REVIEW':
        return 25;
      case 'IN_PROGRESS':
        return 60;
      case 'ESCALATED':
        return 80;
      case 'RESOLVED':
        return 100;
      default:
        return 20;
    }
  };

  // Generate timeline based on real data
  const generateTimeline = (complaintData, status) => {
    const timeline = [];
    
    // Always add submission event
    timeline.push({
      title: 'Complaint Submitted',
      description: `Complaint "${complaintData.title}" submitted successfully.`,
      date: new Date(complaintData.createdAt).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      status: 'COMPLETED'
    });

    // Add assignment event if assigned
    if (complaintData.assignedTo) {
      timeline.unshift({
        title: 'Assigned to Staff',
        description: `Complaint assigned to ${complaintData.assignedTo.name} for investigation.`,
        date: new Date().toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
        status: status === 'RESOLVED' ? 'COMPLETED' : 'IN_PROGRESS'
      });
    }

    // Add resolution event if resolved
    if (status === 'RESOLVED') {
      timeline.unshift({
        title: 'Complaint Resolved',
        description: `Your complaint has been successfully resolved by our team.`,
        date: new Date().toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
        status: 'COMPLETED'
      });
    }

    return timeline;
  };

  // File helper functions
  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) return '🖼️';
    if (fileType === 'application/pdf') return '📄';
    if (fileType.includes('document') || fileType.includes('word')) return '📝';
    if (fileType.startsWith('video/')) return '🎥';
    return '📎';
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const downloadFile = async (fileId, fileName) => {
    try {
      const response = await api.get(`/api/complaints/files/${fileId}/download`, {
        responseType: 'blob',
      });
      
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading file:', err);
      alert('Failed to download file. You may not have permission to access this file.');
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'UNDER_REVIEW':
        return { bg: 'warning', label: 'Under Review', gradient: 'linear-gradient(45deg, #feca57, #ff9ff3)' };
      case 'IN_PROGRESS':
        return { bg: 'info', label: 'In Progress', gradient: 'linear-gradient(45deg, #74b9ff, #0984e3)' };
      case 'ESCALATED':
        return { bg: 'danger', label: 'Escalated', gradient: 'linear-gradient(45deg, #fd79a8, #e84393)' };
      case 'RESOLVED':
        return { bg: 'success', label: 'Resolved', gradient: 'linear-gradient(45deg, #00b894, #00cec9)' };
      default:
        return { bg: 'secondary', label: status || 'Unknown', gradient: 'none' };
    }
  };

  if (loading) {
    return (
      <div className="min-vh-100 position-relative overflow-hidden d-flex align-items-center justify-content-center" style={{
        background: 'linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)',
        backgroundSize: '400% 400%',
        animation: 'gradientShift 15s ease infinite'
      }}>
        <div className="position-relative z-2 text-center">
          <div className="spinner-border text-white fs-1 shadow-lg" role="status" style={{ width: '4rem', height: '4rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-white mt-3 fs-5 fw-semibold">Loading complaint #{id}...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-vh-100 position-relative overflow-hidden d-flex align-items-center justify-content-center" style={{
        background: 'linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)',
        backgroundSize: '400% 400%',
        animation: 'gradientShift 15s ease infinite'
      }}>
        <div className="position-relative z-2 text-center">
          <div className="bg-white bg-opacity-20 rounded-circle mx-auto mb-4 d-flex align-items-center justify-content-center shadow-lg" style={{ width: '90px', height: '90px' }}>
            <i className="bi bi-exclamation-triangle fs-1 text-white"></i>
          </div>
          <h2 className="text-white mb-3">Error Loading Complaint</h2>
          <p className="text-white mb-4">{error}</p>
          <Link to="/" className="btn btn-outline-light btn-lg px-4 py-2">
            <i className="bi bi-arrow-left me-2"></i>Back to Home
          </Link>
        </div>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="min-vh-100 position-relative overflow-hidden d-flex align-items-center justify-content-center" style={{
        background: 'linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)',
        backgroundSize: '400% 400%',
        animation: 'gradientShift 15s ease infinite'
      }}>
        <div className="position-relative z-2 text-center">
          <div className="bg-white bg-opacity-20 rounded-circle mx-auto mb-4 d-flex align-items-center justify-content-center shadow-lg" style={{ width: '90px', height: '90px' }}>
            <i className="bi bi-search fs-1 text-white"></i>
          </div>
          <h2 className="text-white mb-3">Complaint Not Found</h2>
          <p className="text-white mb-4">Complaint #{id} could not be found in our system.</p>
          <Link to="/" className="btn btn-outline-light btn-lg px-4 py-2">
            <i className="bi bi-arrow-left me-2"></i>Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(complaint.status);

  return (
    <div className="min-vh-100 position-relative overflow-hidden" style={{
      background: 'linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)',
      backgroundSize: '400% 400%',
      animation: 'gradientShift 15s ease infinite'
    }}>
      {/* Floating Particles */}
      <div className="position-absolute top-10 start-10 w-20 h-20 bg-primary bg-opacity-20 rounded-circle" style={{ zIndex: 1 }}></div>
      <div className="position-absolute top-50 end-20 w-16 h-16 bg-warning bg-opacity-20 rounded-circle" style={{ zIndex: 1 }}></div>
      <div className="position-absolute bottom-20 start-25 w-24 h-24 bg-success bg-opacity-15 rounded-circle" style={{ zIndex: 1 }}></div>

      <Container className="py-5 position-relative z-2">
        <Row className="justify-content-center">
          <Col lg={9} xl={8}>
            <Card className="shadow-xl border-0" style={{
              background: 'rgba(255, 255, 255, 0.25)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderRadius: '24px',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <Card.Body className="p-4 p-lg-5">
                {/* Header */}
                <div className="text-center mb-5">
                  <div className="bg-white bg-opacity-20 rounded-circle mx-auto mb-4 d-flex align-items-center justify-content-center shadow-lg" style={{ width: '90px', height: '90px' }}>
                    <i className="bi bi-file-earmark-text fs-1 text-white"></i>
                  </div>
                  <h1 className="fw-bold mb-3 text-white fs-2">
                    Complaint <span className="text-warning">#{id}</span>
                  </h1>
                  <Badge
                    bg={statusConfig.bg}
                    className="px-4 py-3 fs-5 fw-semibold shadow-sm"
                    style={{
                      background: statusConfig.gradient !== 'none' ? statusConfig.gradient : undefined
                    }}
                  >
                    {statusConfig.label}
                  </Badge>
                </div>

                {/* Progress Bar */}
                <div className="mb-5">
                  <div className="text-center mb-4">
                    <h5 className="text-white fw-bold mb-2">Progress</h5>
                    <div className="text-white-50 fs-6 mb-3">
                      {complaint.progress}% Complete
                    </div>
                  </div>
                  <ProgressBar
                    now={complaint.progress}
                    className="shadow-lg mb-3"
                    style={{ height: '12px', borderRadius: '20px', background: 'rgba(255,255,255,0.2)' }}
                    variant={complaint.progress === 100 ? 'success' : 'info'}
                  />
                  <div className="d-flex justify-content-between text-white small opacity-80">
                    <span>Submitted</span>
                    <span>Review</span>
                    <span>Investigation</span>
                    <span>Resolved</span>
                  </div>
                </div>

                {/* Files Section */}
                {files.length > 0 && (
                  <div className="mb-5">
                    <div className="text-center mb-4">
                      <h5 className="text-white fw-bold mb-2">
                        <i className="bi bi-paperclip me-2"></i>Attachments
                      </h5>
                      <div className="text-white-50 fs-6">
                        {files.length} file{files.length !== 1 ? 's' : ''} attached
                        {isAdmin && <span className="ms-2 badge bg-warning text-dark">Admin View</span>}
                      </div>
                    </div>
                    
                    <div className="row g-3">
                      {files.map((file, index) => (
                        <div key={file.id} className="col-md-6">
                          <div 
                            className="p-3 rounded-3 d-flex align-items-center justify-content-between"
                            style={{
                              background: 'rgba(255, 255, 255, 0.15)',
                              backdropFilter: 'blur(10px)',
                              border: '1px solid rgba(255, 255, 255, 0.2)'
                            }}
                          >
                            <div className="d-flex align-items-center flex-grow-1">
                              <span className="fs-4 me-3">{getFileIcon(file.fileType)}</span>
                              <div className="flex-grow-1">
                                <div className="text-white fw-semibold small">{file.fileName}</div>
                                <div className="text-white-50 small">
                                  {formatFileSize(file.fileSize)} • {file.fileCategory}
                                  {file.adminOnly && (
                                    <span className="ms-2 badge bg-warning text-dark small">Admin Only</span>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            {/* Download button - only show if user has access */}
                            {(!file.adminOnly || isAdmin) && (
                              <Button
                                variant="outline-light"
                                size="sm"
                                onClick={() => downloadFile(file.id, file.fileName)}
                                className="ms-2"
                                style={{ borderRadius: '8px' }}
                              >
                                <i className="bi bi-download"></i>
                              </Button>
                            )}
                            
                            {/* Show lock icon if user doesn't have access */}
                            {file.adminOnly && !isAdmin && (
                              <div className="ms-2 text-white-50">
                                <i className="bi bi-lock-fill" title="Admin access required"></i>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {filesLoading && (
                      <div className="text-center text-white-50">
                        <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                        Loading files...
                      </div>
                    )}
                  </div>
                )}

                {/* Timeline */}
                <div className="mb-5" style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '20px',
                  padding: '2rem',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(15px)'
                }}>
                  <h5 className="text-white fw-bold mb-4 text-center">
                    <i className="bi bi-clock-history me-2"></i>Update Timeline
                  </h5>

                  {complaint.timeline.map((event, index) => (
                    <div
                      key={index}
                      style={{
                        position: 'relative',
                        paddingLeft: '40px',
                        marginBottom: index === complaint.timeline.length - 1 ? '0' : '2rem'
                      }}
                    >
                      <div
                        className="position-absolute"
                        style={{
                          left: '8px',
                          top: '8px',
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          background: event.status === 'COMPLETED' ? '#00b894' : '#feca57',
                          border: '4px solid rgba(255,255,255,0.9)',
                          zIndex: 2,
                          boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                        }}
                      ></div>
                      <div
                        className="p-4 shadow-lg border-start border-4"
                        style={{
                          background: 'rgba(255, 255, 255, 0.15)',
                          borderRadius: '0 20px 20px 0',
                          backdropFilter: 'blur(10px)',
                          borderColor: event.status === 'COMPLETED' ? '#00b894' : '#feca57'
                        }}
                      >
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <h6 className="text-white fw-bold mb-0 fs-5">{event.title}</h6>
                          <Badge bg="light" className="px-3 py-1 fw-semibold text-dark">
                            {event.date}
                          </Badge>
                        </div>
                        <p className="text-white opacity-90 mb-0 fs-6 lh-lg">
                          {event.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Action Button */}
                <div className="text-center pt-4">
                  <Link
                    to="/"
                    className="btn btn-outline-light btn-lg px-5 py-3 fw-bold shadow-lg border-3"
                    style={{
                      borderRadius: '16px',
                      backdropFilter: 'blur(10px)',
                      borderColor: 'rgba(255, 255, 255, 0.4)',
                      fontSize: '1.1rem'
                    }}
                  >
                    <i className="bi bi-arrow-left me-2"></i>
                    Back to Dashboard
                  </Link>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ComplaintDetails;
