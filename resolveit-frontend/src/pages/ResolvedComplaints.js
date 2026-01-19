import React, { useState, useEffect, useContext } from "react";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Button, Badge, Alert } from "react-bootstrap";

export default function ResolvedComplaints() {
  const { auth, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [resolvedComplaints, setResolvedComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all"); // all, resolved, closed

  useEffect(() => {
    // Check authentication
    if (!auth?.token || !auth?.user) {
      navigate("/login");
      return;
    }

    // Check if user has permission (ADMIN or STAFF)
    if (auth.user.role !== 'ADMIN' && auth.user.role !== 'STAFF') {
      alert("Access denied. Admin or Staff role required.");
      navigate("/login");
      return;
    }

    loadResolvedComplaints();
  }, [auth, navigate, filter]);

  const loadResolvedComplaints = async () => {
    try {
      setLoading(true);
      setError("");

      let endpoint = "/api/complaints/resolved";
      if (filter === "resolved") {
        endpoint = "/api/complaints/resolved/resolved";
      } else if (filter === "closed") {
        endpoint = "/api/complaints/resolved/closed";
      }

      const response = await api.get(endpoint);
      
      if (response.data.success) {
        setResolvedComplaints(response.data.complaints || []);
        console.log(`✅ Loaded ${response.data.count} resolved complaints`);
      } else {
        setError(response.data.message || "Failed to load resolved complaints");
      }

    } catch (err) {
      console.error("❌ Error loading resolved complaints:", err);
      setError(`Failed to load resolved complaints: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString() + " " + new Date(dateString).toLocaleTimeString();
  };

  const getStatusBadgeColor = (statusCode) => {
    switch (statusCode) {
      case "RESOLVED": return "success";
      case "CLOSED": return "secondary";
      default: return "primary";
    }
  };

  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading resolved complaints...</p>
        </div>
      </Container>
    );
  }

  return (
    <div className="min-vh-100" style={{ backgroundColor: '#f8f9fa' }}>
      <Container fluid className="py-4">
        {/* Header */}
        <Row className="mb-4">
          <Col>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h2 className="mb-1">📋 Resolved Complaints</h2>
                <p className="text-muted mb-0">View and manage resolved complaints</p>
              </div>
              <div className="d-flex gap-2">
                <Button variant="outline-primary" onClick={() => navigate(-1)}>
                  ← Back
                </Button>
                <Button variant="outline-danger" onClick={handleLogout}>
                  🚪 Logout
                </Button>
              </div>
            </div>
          </Col>
        </Row>

        {/* Filter Buttons */}
        <Row className="mb-4">
          <Col>
            <div className="d-flex gap-2">
              <Button 
                variant={filter === "all" ? "primary" : "outline-primary"}
                onClick={() => setFilter("all")}
              >
                All Resolved ({resolvedComplaints.length})
              </Button>
              <Button 
                variant={filter === "resolved" ? "success" : "outline-success"}
                onClick={() => setFilter("resolved")}
              >
                Resolved Only
              </Button>
              <Button 
                variant={filter === "closed" ? "secondary" : "outline-secondary"}
                onClick={() => setFilter("closed")}
              >
                Closed Only
              </Button>
            </div>
          </Col>
        </Row>

        {/* Error Alert */}
        {error && (
          <Row className="mb-4">
            <Col>
              <Alert variant="danger">
                <Alert.Heading>Error</Alert.Heading>
                {error}
              </Alert>
            </Col>
          </Row>
        )}

        {/* Complaints List */}
        <Row>
          {resolvedComplaints.length === 0 ? (
            <Col>
              <Card className="text-center py-5">
                <Card.Body>
                  <h4>📭 No Resolved Complaints Found</h4>
                  <p className="text-muted">There are no resolved complaints to display.</p>
                </Card.Body>
              </Card>
            </Col>
          ) : (
            resolvedComplaints.map((complaint) => (
              <Col md={6} lg={4} key={complaint.id} className="mb-4">
                <Card className="h-100 shadow-sm">
                  <Card.Header className="d-flex justify-content-between align-items-center">
                    <Badge bg={getStatusBadgeColor(complaint.statusCode)}>
                      {complaint.status}
                    </Badge>
                    <small className="text-muted">ID: #{complaint.id}</small>
                  </Card.Header>
                  
                  <Card.Body>
                    <Card.Title className="h5 mb-3">{complaint.title}</Card.Title>
                    
                    <div className="mb-3">
                      <p className="text-muted mb-1">
                        <strong>Category:</strong> {complaint.category}
                      </p>
                      <p className="text-muted mb-1">
                        <strong>Created:</strong> {formatDate(complaint.createdAt)}
                      </p>
                      <p className="text-muted mb-1">
                        <strong>Resolved:</strong> {formatDate(complaint.updatedAt)}
                      </p>
                    </div>

                    {complaint.description && (
                      <div className="mb-3">
                        <p className="small text-muted">
                          {complaint.description.length > 100 
                            ? complaint.description.substring(0, 100) + "..."
                            : complaint.description
                          }
                        </p>
                      </div>
                    )}

                    <div className="mb-3">
                      {complaint.anonymous ? (
                        <Badge bg="warning" text="dark">Anonymous</Badge>
                      ) : (
                        <div>
                          <strong>User:</strong> {complaint.user?.name || "N/A"}
                        </div>
                      )}
                    </div>

                    {complaint.assignedTo && (
                      <div className="mb-3">
                        <strong>Resolved by:</strong> {complaint.assignedTo.name}
                      </div>
                    )}

                    {complaint.hasFiles && (
                      <div className="mb-3">
                        <Badge bg="info">📎 {complaint.fileCount} file(s)</Badge>
                      </div>
                    )}
                  </Card.Body>

                  <Card.Footer className="bg-transparent">
                    <Button 
                      variant="outline-primary" 
                      size="sm"
                      onClick={() => navigate(`/complaints/${complaint.id}`)}
                      className="w-100"
                    >
                      View Details
                    </Button>
                  </Card.Footer>
                </Card>
              </Col>
            ))
          )}
        </Row>
      </Container>
    </div>
  );
}