import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Spinner } from 'react-bootstrap';

export default function TrackComplaint() {
  const [trackId, setTrackId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTrack = (e) => {
    e.preventDefault();

    if (!trackId.trim()) {
      alert('Enter complaint ID!');
      return;
    }

    setLoading(true);

    // DIRECT BROWSER NAVIGATION - 100% WORKS
    setTimeout(() => {
      window.location.href = `/complaints/${trackId}`;
    }, 1500);
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center p-5" style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)'
    }}>
      <Container>
        <Row className="justify-content-center">
          <Col md={6}>
            <Card className="shadow-lg border-0 p-5" style={{
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(20px)',
              borderRadius: '20px'
            }}>
              <Card.Body className="text-center">
                <h2 className="text-white mb-4">🔍 Track Complaint</h2>

                <Form onSubmit={handleTrack}>
                  <Form.Group className="mb-4">
                    <Form.Control
                      type="text"
                      className="form-control-lg text-center py-3"
                      placeholder="Enter ID (e.g. 123)"
                      value={trackId}
                      onChange={(e) => setTrackId(e.target.value)}
                    />
                  </Form.Group>

                  <Button
                    type="submit"
                    className="w-100 btn-lg py-3 fw-bold mb-3"
                    variant="warning"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Redirecting...
                      </>
                    ) : (
                      'Track Complaint'
                    )}
                  </Button>
                </Form>

                <Button
                  variant="outline-light"
                  className="w-100 py-2"
                  onClick={() => window.location.href = '/complaint'}
                >
                  New Complaint
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
