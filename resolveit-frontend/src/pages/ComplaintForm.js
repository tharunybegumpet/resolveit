import React, { useState, useContext, useEffect } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Form, Button, Alert } from "react-bootstrap";
import { AuthContext } from "../context/AuthContext";

export default function ComplaintForm() {
  const nav = useNavigate();
  const { auth } = useContext(AuthContext);
  const [errors, setErrors] = useState({});

  // 🔥 REDIRECT TO LOGIN IF NOT AUTHENTICATED
  useEffect(() => {
    if (!auth.token) {
      nav("/login");
    }
  }, [auth.token, nav]);

  const [data, setData] = useState({
    title: "",
    category: "",
    description: "",
    anonymous: false,
    userId: null,
    trackId: "",
  });

  const [files, setFiles] = useState([]);
  const [fileErrors, setFileErrors] = useState([]);
  const [showTrack, setShowTrack] = useState(false);
  const [loading, setLoading] = useState(false);

  // File type restrictions
  const allowedFileTypes = {
    images: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    documents: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
    videos: ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/webm']
  };

  const maxFileSizes = {
    image: 5 * 1024 * 1024, // 5MB
    document: 10 * 1024 * 1024, // 10MB
    video: 50 * 1024 * 1024 // 50MB
  };

  const validateFiles = (selectedFiles) => {
    const errors = [];
    const validFiles = [];

    Array.from(selectedFiles).forEach((file, index) => {
      const fileType = file.type;
      const fileSize = file.size;
      
      // Check if file type is allowed
      const isImage = allowedFileTypes.images.includes(fileType);
      const isDocument = allowedFileTypes.documents.includes(fileType);
      const isVideo = allowedFileTypes.videos.includes(fileType);
      
      if (!isImage && !isDocument && !isVideo) {
        errors.push(`File "${file.name}": File type not allowed. Allowed: Images, PDFs, Documents, Videos`);
        return;
      }
      
      // Check file size
      let maxSize;
      if (isImage) maxSize = maxFileSizes.image;
      else if (isDocument) maxSize = maxFileSizes.document;
      else if (isVideo) maxSize = maxFileSizes.video;
      
      if (fileSize > maxSize) {
        const maxSizeMB = Math.round(maxSize / (1024 * 1024));
        errors.push(`File "${file.name}": File too large. Maximum size: ${maxSizeMB}MB`);
        return;
      }
      
      validFiles.push(file);
    });

    return { errors, validFiles };
  };

  const handleFileChange = (e) => {
    const selectedFiles = e.target.files;
    if (selectedFiles.length === 0) {
      setFiles([]);
      setFileErrors([]);
      return;
    }

    const { errors, validFiles } = validateFiles(selectedFiles);
    setFiles(validFiles);
    setFileErrors(errors);
  };

  const getFileIcon = (fileType) => {
    if (allowedFileTypes.images.includes(fileType)) return '🖼️';
    if (fileType === 'application/pdf') return '📄';
    if (allowedFileTypes.documents.includes(fileType)) return '📝';
    if (allowedFileTypes.videos.includes(fileType)) return '🎥';
    return '📎';
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateForm = () => {
    const newErrors = {};

    if (!showTrack && !data.title.trim()) {
      newErrors.title = "Title is required";
    }
    if (!showTrack && !data.category) {
      newErrors.category = "Category is required";
    }
    if (!showTrack && !data.description.trim()) {
      newErrors.description = "Description is required";
    }
    if (showTrack && !data.trackId.trim()) {
      newErrors.trackId = "Track ID is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!validateForm()) return;

    setLoading(true);

    try {
      if (files.length > 0) {
        // Submit with files using FormData
        const formData = new FormData();
        formData.append('title', data.title);
        formData.append('category', data.category);
        formData.append('description', data.description);
        formData.append('anonymous', data.anonymous);
        
        // Add files
        files.forEach((file) => {
          formData.append('files', file);
        });

        const res = await api.post("/api/complaints/with-files", formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        nav(`/success/${res.data.complaintId || res.data.id}`);
      } else {
        // Submit without files (original method)
        const payload = {
          title: data.title,
          category: data.category,
          description: data.description,
          anonymous: data.anonymous
        };
        
        const res = await api.post("/api/complaints", payload);
        nav(`/success/${res.data.complaintId || res.data.id}`);
      }
    } catch (err) {
      console.error('Submit error:', err);
      setErrors({ submit: "Failed to submit complaint. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 position-relative overflow-hidden" style={{
      background: 'linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)',
      backgroundSize: '400% 400%',
      animation: 'gradientShift 15s ease infinite'
    }}>
      <style>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .form-control:invalid {
          border-color: rgba(255,255,255,0.3) !important;
          box-shadow: none !important;
        }
      `}</style>

      <Container className="py-5 position-relative z-2">
        <Row className="justify-content-center">
          <Col md={8} lg={7} xl={6}>
            <Card className="shadow-xl border-0" style={{
              background: 'rgba(255, 255, 255, 0.25)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderRadius: '24px',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <Card.Body className="p-4 p-lg-5">
                <div className="text-center mb-5">
                  <div className="bg-white bg-opacity-20 rounded-circle mx-auto mb-4 d-flex align-items-center justify-content-center shadow-lg" style={{width: '90px', height: '90px'}}>
                    <i className="bi bi-exclamation-triangle fs-1 text-white"></i>
                  </div>
                  <h2 className="fw-bold mb-2 text-white">Submit Complaint</h2>
                  <p className="text-white opacity-90 mb-0 fs-6">Report your issue securely</p>
                  
                  {/* Back to Dashboard Button */}
                  <Button
                    variant="outline-light"
                    size="sm"
                    onClick={() => nav("/dashboard")}
                    className="mt-3"
                    style={{ fontSize: '0.9rem' }}
                  >
                    ← Back to Dashboard
                  </Button>
                </div>

                {errors.submit && (
                  <Alert variant="danger" className="mb-4">
                    {errors.submit}
                  </Alert>
                )}

                <Form onSubmit={submit} noValidate>
                  {/* TRACK OPTION */}
                  <Form.Group className="mb-4">
                    <Form.Check
                      type="checkbox"
                      label={<span className="text-white fs-6"><i className="bi bi-search me-1"></i>Track existing complaint?</span>}
                      checked={showTrack}
                      onChange={(e) => {
                        setShowTrack(e.target.checked);
                        if (!e.target.checked) {
                          setData({ ...data, trackId: "" });
                          setErrors({});
                        }
                      }}
                    />
                  </Form.Group>

                  {showTrack && (
                    <Form.Group className="mb-4">
                      <Form.Label className="fw-semibold text-white mb-2 fs-6">
                        <i className="bi bi-qr-code-scan me-1"></i>Track ID
                      </Form.Label>
                      <div className="input-group">
                        <span className="input-group-text bg-white bg-opacity-20 text-white border-0" style={{ borderRadius: '12px 0 0 12px' }}>
                          <i className="bi bi-fingerprint"></i>
                        </span>
                        <Form.Control
                          type="text"
                          placeholder="Enter your complaint track ID"
                          value={data.trackId}
                          onChange={(e) => {
                            setData({ ...data, trackId: e.target.value });
                            if (errors.trackId) setErrors({});
                          }}
                          className="py-3 shadow-none border-0 text-white"
                          style={{
                            background: 'rgba(255, 255, 255, 0.1)',
                            borderRadius: '0 12px 12px 0',
                            fontSize: '1.1rem',
                            backdropFilter: 'blur(10px)'
                          }}
                        />
                      </div>
                      {errors.trackId && <div className="text-danger small mt-1">{errors.trackId}</div>}
                    </Form.Group>
                  )}

                  {/* VISIBILITY */}
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold text-white mb-3 fs-6">Visibility</Form.Label>
                    <div className="d-flex gap-4 justify-content-center">
                      <Form.Check
                        inline
                        type="radio"
                        id="public"
                        label={<span className="text-white fs-6"><i className="bi bi-eye me-1"></i>Public</span>}
                        name="mode"
                        checked={!data.anonymous}
                        onChange={() => setData({ ...data, anonymous: false })}
                      />
                      <Form.Check
                        inline
                        type="radio"
                        id="anonymous"
                        label={<span className="text-white fs-6"><i className="bi bi-eye-slash me-1"></i>Anonymous</span>}
                        name="mode"
                        checked={data.anonymous}
                        onChange={() => setData({ ...data, anonymous: true })}
                      />
                    </div>
                  </Form.Group>

                  {/* TITLE */}
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold text-white mb-2 fs-6">
                      <i className="bi bi-tag me-1"></i>Title
                    </Form.Label>
                    <div className="input-group">
                      <span className="input-group-text bg-white bg-opacity-20 text-white border-0" style={{ borderRadius: '12px 0 0 12px' }}>
                        <i className="bi bi-hash"></i>
                      </span>
                      <Form.Control
                        type="text"
                        placeholder="Enter complaint title"
                        value={data.title}
                        onChange={(e) => {
                          setData({ ...data, title: e.target.value });
                          if (errors.title) setErrors({});
                        }}
                        className="py-3 shadow-none border-0 text-white"
                        style={{
                          background: 'rgba(255, 255, 255, 0.1)',
                          borderRadius: '0 12px 12px 0',
                          fontSize: '1.1rem',
                          backdropFilter: 'blur(10px)'
                        }}
                      />
                    </div>
                    {errors.title && <div className="text-white bg-danger bg-opacity-75 small mt-2 p-2 rounded">{errors.title}</div>}
                  </Form.Group>

                  {/* CATEGORY */}
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold text-white mb-2 fs-6">
                      <i className="bi bi-folder me-1"></i>Category
                    </Form.Label>
                    <div className="input-group">
                      <span className="input-group-text bg-white bg-opacity-20 text-white border-0" style={{ borderRadius: '12px 0 0 12px' }}>
                        <i className="bi bi-list-ul"></i>
                      </span>
                      <Form.Select
                        value={data.category}
                        onChange={(e) => {
                          setData({ ...data, category: e.target.value });
                          if (errors.category) setErrors({});
                        }}
                        className="py-3 shadow-none border-0"
                        style={{
                          background: 'rgba(255, 255, 255, 0.1)',
                          borderRadius: '0 12px 12px 0',
                          fontSize: '1.1rem',
                          backdropFilter: 'blur(10px)',
                          color: data.category ? 'white' : 'rgba(255, 255, 255, 0.6)',
                          fontWeight: data.category ? '500' : '400'
                        }}
                      >
                        <option value="" style={{ background: '#495057', color: 'white' }}>Select a category</option>
                        <option value="Maintenance" style={{ background: '#495057', color: 'white' }}>🔧 Maintenance</option>
                        <option value="Technical Issues" style={{ background: '#495057', color: 'white' }}>💻 Technical Issues</option>
                        <option value="Transport" style={{ background: '#495057', color: 'white' }}>🚗 Transport</option>
                        <option value="Facilities" style={{ background: '#495057', color: 'white' }}>🏢 Facilities</option>
                        <option value="Safety & Security" style={{ background: '#495057', color: 'white' }}>🛡️ Safety & Security</option>
                        <option value="Administrative" style={{ background: '#495057', color: 'white' }}>📋 Administrative</option>
                        <option value="Other" style={{ background: '#495057', color: 'white' }}>📌 Other</option>
                      </Form.Select>
                    </div>
                    {errors.category && <div className="text-white bg-danger bg-opacity-75 small mt-2 p-2 rounded">{errors.category}</div>}
                  </Form.Group>

                  {/* DESCRIPTION */}
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold text-white mb-2 fs-6">
                      <i className="bi bi-card-text me-1"></i>Description
                    </Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={5}
                      placeholder="Describe your complaint in detail..."
                      value={data.description}
                      onChange={(e) => {
                        setData({ ...data, description: e.target.value });
                        if (errors.description) setErrors({});
                      }}
                      className="py-3 shadow-none border-0 text-white"
                      style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        fontSize: '1rem',
                        backdropFilter: 'blur(10px)'
                      }}
                    />
                    {errors.description && <div className="text-danger small mt-1">{errors.description}</div>}
                  </Form.Group>

                  {/* ATTACHMENTS */}
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold text-white mb-2 fs-6">
                      <i className="bi bi-paperclip me-1"></i>Attachments (Optional)
                    </Form.Label>
                    <p className="text-white-50 small mb-2">
                      📷 Images (5MB max) • 📄 PDFs (10MB max) • 🎥 Videos (50MB max) • 📝 Documents (10MB max)
                    </p>
                    <Form.Control
                      type="file"
                      multiple
                      accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx,.txt,.mp4,.avi,.mov,.wmv,.webm"
                      onChange={handleFileChange}
                      className="py-3 shadow-none border-0 text-white"
                      style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        backdropFilter: 'blur(10px)'
                      }}
                    />
                    
                    {/* File Errors */}
                    {fileErrors.length > 0 && (
                      <div className="mt-2">
                        {fileErrors.map((error, index) => (
                          <div key={index} className="text-warning small bg-warning bg-opacity-20 p-2 rounded mb-1">
                            ⚠️ {error}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Selected Files Preview */}
                    {files.length > 0 && (
                      <div className="mt-3">
                        <p className="text-white small mb-2">Selected Files:</p>
                        {files.map((file, index) => (
                          <div key={index} className="bg-white bg-opacity-20 rounded p-2 mb-2 d-flex align-items-center justify-content-between">
                            <div className="d-flex align-items-center">
                              <span className="me-2">{getFileIcon(file.type)}</span>
                              <div>
                                <div className="text-white small fw-semibold">{file.name}</div>
                                <div className="text-white-50 small">
                                  {formatFileSize(file.size)}
                                  {(file.type === 'application/pdf' || file.type.startsWith('video/')) && 
                                    <span className="ms-2 badge bg-warning text-dark">Admin Only</span>
                                  }
                                </div>
                              </div>
                            </div>
                            <Button
                              variant="outline-light"
                              size="sm"
                              onClick={() => {
                                const newFiles = files.filter((_, i) => i !== index);
                                setFiles(newFiles);
                              }}
                            >
                              ✕
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </Form.Group>

                  {/* 🔥 BUTTONS SECTION */}
                  <div className="d-grid gap-3 mt-4">
                    <Button
                      type="submit"
                      className="py-3 fw-bold fs-5 shadow-lg"
                      style={{
                        background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
                        border: 'none',
                        borderRadius: '16px',
                        fontSize: '1.1rem'
                      }}
                      disabled={loading}
                    >
                      <i className="bi bi-send-fill me-2"></i>
                      {loading ? "Submitting..." : (showTrack ? "Update Complaint" : "Submit Complaint")}
                    </Button>

                    {/* 🔥 TRACK COMPLAINT BUTTON */}
                    <Button
                      variant="outline-light"
                      className="py-3 fw-bold fs-6 border-2"
                      style={{
                        borderRadius: '16px',
                        fontSize: '1rem',
                        backdropFilter: 'blur(10px)',
                        borderColor: 'rgba(255, 255, 255, 0.5)'
                      }}
                      onClick={() => nav('/track')}
                      disabled={loading}
                    >
                      <i className="bi bi-search me-2"></i>
                      Track Complaint
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
