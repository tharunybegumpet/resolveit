import React from "react";
import { Link } from "react-router-dom";
import { Container, Row, Col, Button, Card, Badge } from "react-bootstrap";

export default function Home() {
  return (
    <div className="min-vh-100" style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <Container fluid className="py-5">
        {/* Hero Section */}
        <Row className="justify-content-center">
          <Col md={10} lg={8}>
            <div className="text-center text-white py-5">
              <Badge pill bg="light" text="dark" className="fs-6 px-3 py-2 mb-4">
                🚀 Live Status Tracking
              </Badge>

              <h1 className="display-3 fw-bold mb-4">Resolve<span className="text-warning">IT</span></h1>

              <p className="lead fs-4 mb-5">
                Your trusted platform to submit complaints securely and track progress in real-time.
              </p>

              <div className="d-grid gap-3 d-md-block mb-5">
                <Link
                  to="/login"
                  className="btn btn-warning btn-lg px-5 py-3 me-md-3 mb-3 mb-md-0 shadow-lg"
                >
                  <i className="bi bi-box-arrow-in-right me-2"></i>
                  Login to Submit Complaint
                </Link>
                <Link
                  to="/register-select"
                  className="btn btn-light btn-lg px-5 py-3 shadow-lg"
                >
                  <i className="bi bi-person-plus me-2"></i>
                  Create Account
                </Link>
              </div>
            </div>
          </Col>
        </Row>
      </Container>

      {/* Feature Cards */}
      <Container className="pb-5">
        <Row className="justify-content-center g-4">
          <Col md={4}>
            <Card className="h-100 shadow-lg border-0" style={{ background: 'rgba(255,255,255,0.95)' }}>
              <Card.Body className="text-center p-4">
                <div className="bg-primary bg-opacity-10 rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center" style={{width: '80px', height: '80px'}}>
                  <i className="bi bi-shield-check fs-1 text-primary"></i>
                </div>
                <Card.Title className="h4 fw-bold mb-3">Secure & Anonymous</Card.Title>
                <Card.Text className="text-muted">
                  Submit complaints publicly or anonymously with enterprise-grade security.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
            <Card className="h-100 shadow-lg border-0" style={{ background: 'rgba(255,255,255,0.95)' }}>
              <Card.Body className="text-center p-4">
                <div className="bg-success bg-opacity-10 rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center" style={{width: '80px', height: '80px'}}>
                  <i className="bi bi-clock-history fs-1 text-success"></i>
                </div>
                <Card.Title className="h4 fw-bold mb-3">Real-time Tracking</Card.Title>
                <Card.Text className="text-muted">
                  Track your complaint status with detailed timeline and updates.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
            <Card className="h-100 shadow-lg border-0" style={{ background: 'rgba(255,255,255,0.95)' }}>
              <Card.Body className="text-center p-4">
                <div className="bg-warning bg-opacity-10 rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center" style={{width: '80px', height: '80px'}}>
                  <i className="bi bi-file-earmark-arrow-up fs-1 text-warning"></i>
                </div>
                <Card.Title className="h4 fw-bold mb-3">File Attachments</Card.Title>
                <Card.Text className="text-muted">
                  Upload documents, photos and evidence to strengthen your case.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
