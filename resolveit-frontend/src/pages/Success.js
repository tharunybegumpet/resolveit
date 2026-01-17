import React from "react";
import { useParams, Link } from "react-router-dom";
import { Container, Row, Col, Card, Badge, Button } from "react-bootstrap";

export default function Success() {
  const { id } = useParams();

  return (
    <div className="min-vh-100 position-relative overflow-hidden" style={{
      background: 'linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)',
      backgroundSize: '400% 400%',
      animation: 'gradientShift 15s ease infinite'
    }}>
      {/* Floating Particles */}
      <div className="position-absolute top-10 start-10 w-20 h-20 bg-success bg-opacity-20 rounded-circle animate__animated animate__pulse animate__infinite" style={{ animationDelay: '0s', zIndex: 1 }} />
      <div className="position-absolute top-50 end-20 w-16 h-16 bg-warning bg-opacity-20 rounded-circle animate__animated animate__bounceIn animate__infinite" style={{ animationDelay: '2s', zIndex: 1 }} />
      <div className="position-absolute bottom-20 start-25 w-24 h-24 bg-primary bg-opacity-15 rounded-circle animate__animated animate__fadeInUp animate__infinite" style={{ animationDelay: '1s', zIndex: 1 }} />

      <Container className="py-5 position-relative z-2">
        <Row className="justify-content-center">
          <Col md={8} lg={6} xl={5}>
            <Card className="shadow-xl border-0 glass-card" style={{
              background: 'rgba(255, 255, 255, 0.25)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderRadius: '24px',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <Card.Body className="p-4 p-lg-5 text-center">
                {/* Success Icon + Header */}
                <div className="mb-5">
                  <div className="bg-success bg-opacity-20 rounded-circle mx-auto mb-4 d-flex align-items-center justify-content-center shadow-lg" style={{width: '120px', height: '120px'}}>
                    <i className="bi bi-check-circle-fill fs-1 text-success" style={{fontSize: '4rem'}}></i>
                  </div>
                  <h1 className="fw-bold mb-3 text-white fs-2">Success!</h1>
                  <h5 className="text-white-50 mb-0 fs-5">Complaint Submitted Successfully</h5>
                </div>

                {/* Complaint ID */}
                <div className="mb-5">
                  <h3 className="text-white-50 mb-3 fs-6 fw-normal">Your Complaint ID:</h3>
                  <div className="bg-white bg-opacity-20 rounded-pill px-5 py-4 shadow-xl mx-auto d-inline-block" style={{
                    fontSize: '3.5rem',
                    fontWeight: '700',
                    letterSpacing: '0.1em',
                    backdropFilter: 'blur(20px)',
                    border: '2px solid rgba(255,255,255,0.3)',
                    minWidth: '250px'
                  }}>
                    <Badge bg="success" className="me-2 fs-6 px-3 py-2 fw-bold" style={{background: '#00b894'}}>
                      #{id}
                    </Badge>
                  </div>
                </div>

                {/* Instructions */}
                <div className="mb-5">
                  <div className="bg-white bg-opacity-10 rounded-4 p-4 shadow-sm" style={{backdropFilter: 'blur(10px)'}}>
                    <h6 className="text-white fw-bold mb-3">
                      <i className="bi bi-info-circle-fill me-2 text-info"></i>Next Steps
                    </h6>
                    <ul className="text-white-50 mb-0 fs-6" style={{textAlign: 'left', paddingLeft: '1.5rem'}}>
                      <li>✅ Save this ID for tracking</li>
                      <li>📱 Use Track feature from dashboard</li>
                      <li>⏰ Receive status updates automatically</li>
                    </ul>
                  </div>
                </div>

                {/* Action Buttons - TRACK REMOVED */}
                <div className="d-grid gap-3">
                  <Link to="/complaint" className="btn btn-success btn-lg py-4 fw-bold shadow-lg border-0 fs-5" style={{
                    background: 'linear-gradient(45deg, #00b894, #00cec9)',
                    borderRadius: '20px',
                    fontWeight: '700',
                    boxShadow: '0 15px 35px rgba(0, 184, 148, 0.4)'
                  }}>
                    <i className="bi bi-plus-circle me-2"></i>
                    Submit New Complaint
                  </Link>

                  <Link to="/" className="btn btn-light btn-lg py-3 fw-semibold shadow-sm" style={{borderRadius: '16px'}}>
                    <i className="bi bi-house-door me-2"></i>
                    Back to Home
                  </Link>
                </div>

                {/* Footer */}
                <div className="mt-5 pt-4" style={{borderTop: '1px solid rgba(255,255,255,0.1)'}}>
                  <p className="text-white-50 mb-0 fs-6">
                    <i className="bi bi-shield-check me-1 text-success"></i>
                    Your complaint is secure with us
                  </p>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
