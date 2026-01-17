import React from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Button } from "react-bootstrap";

export default function RegisterSelect() {
  const navigate = useNavigate();

  return (
    <div className="min-vh-100 position-relative overflow-hidden">
      <div className="position-absolute top-0 start-0 w-100 h-100" style={{
        background: 'linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)',
        backgroundSize: '400% 400%',
        animation: 'gradientShift 15s ease infinite'
      }}></div>

      <Container className="py-5 position-relative z-2">
        <Row className="justify-content-center">
          <Col md={10} lg={8}>
            <div className="text-center text-white mb-5">
              <h1 className="display-4 fw-bold mb-4">Create User Account</h1>
              <p className="lead fs-5 mb-0">Register to submit and track your complaints</p>
            </div>
          </Col>
        </Row>

        <Row className="justify-content-center g-4">
          {/* User Registration - Only Option */}
          <Col md={6} lg={5}>
            <Card className="h-100 shadow-xl border-0" style={{
              background: 'rgba(255, 255, 255, 0.25)',
              backdropFilter: 'blur(20px)',
              borderRadius: '24px',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <Card.Body className="p-5 text-center">
                <div className="bg-white bg-opacity-20 rounded-circle mx-auto mb-4 d-flex align-items-center justify-content-center shadow-lg" style={{width: '100px', height: '100px'}}>
                  <i className="bi bi-person fs-1 text-white"></i>
                </div>
                <h3 className="fw-bold mb-3 text-white">User Registration</h3>
                <p className="text-white opacity-90 mb-4 fs-5">
                  Create your account to:
                </p>
                <ul className="text-white opacity-90 mb-4 text-start">
                  <li>Submit complaints and issues</li>
                  <li>Track complaint status</li>
                  <li>Apply to become staff member</li>
                  <li>Receive updates on resolutions</li>
                </ul>
                <Button
                  onClick={() => navigate('/register')}
                  className="w-100 py-3 fw-bold shadow-lg border-0 fs-5"
                  style={{
                    background: 'linear-gradient(45deg, #007bff, #0056b3)',
                    borderRadius: '16px'
                  }}
                >
                  👤 Create User Account
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="justify-content-center mt-5">
          <Col md={6} className="text-center">
            <div className="bg-white bg-opacity-10 rounded-4 p-4 mb-4">
              <h5 className="text-white mb-3">📋 Note for Administrators</h5>
              <p className="text-white opacity-90 mb-0">
                Admin accounts are created manually by system administrators. 
                Contact your system administrator if you need admin access.
              </p>
            </div>
            <Button
              variant="outline-light"
              size="lg"
              onClick={() => navigate('/login')}
              className="px-5 py-3 shadow-lg"
              style={{ borderRadius: '16px' }}
            >
              ← Back to Login
            </Button>
          </Col>
        </Row>
      </Container>
    </div>
  );
}