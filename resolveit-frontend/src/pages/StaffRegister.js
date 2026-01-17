import React, { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Form, Button } from "react-bootstrap";

export default function StaffRegister() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const register = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await api.post("/auth/create-staff", { name, email, password });

      if (res.data.status === "success") {
        alert("✅ Staff account created successfully!");
        nav("/login");
      } else {
        alert("❌ " + res.data.message);
      }
    } catch (err) {
      alert("❌ Registration Failed: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 position-relative overflow-hidden">
      <div className="position-absolute top-0 start-0 w-100 h-100" style={{
        background: 'linear-gradient(-45deg, #667eea, #764ba2, #6B73FF, #9A9CE3)',
        backgroundSize: '400% 400%',
        animation: 'gradientShift 15s ease infinite'
      }}></div>

      <Container className="py-5 position-relative z-2">
        <Row className="justify-content-center">
          <Col md={5} lg={4}>
            <Card className="shadow-xl border-0" style={{
              background: 'rgba(255, 255, 255, 0.25)',
              backdropFilter: 'blur(20px)',
              borderRadius: '24px',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <Card.Body className="p-4 p-md-5">
                <div className="text-center mb-5">
                  <div className="bg-white bg-opacity-20 rounded-circle mx-auto mb-4 d-flex align-items-center justify-content-center shadow-lg" style={{width: '90px', height: '90px'}}>
                    <i className="bi bi-person-badge fs-1 text-white"></i>
                  </div>
                  <h2 className="fw-bold mb-2 text-white">Create Staff Account</h2>
                  <p className="text-white opacity-90 mb-0 fs-6">Register as a staff member</p>
                </div>

                <Form onSubmit={register}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold text-white mb-2 fs-6">Full Name</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter your full name"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="py-3 shadow-none border-0 text-white"
                      style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        fontSize: '1.1rem',
                        backdropFilter: 'blur(10px)'
                      }}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold text-white mb-2 fs-6">Email Address</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="py-3 shadow-none border-0 text-white"
                      style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        fontSize: '1.1rem',
                        backdropFilter: 'blur(10px)'
                      }}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold text-white mb-2 fs-6">Password</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Create a password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="py-3 shadow-none border-0 text-white"
                      style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        fontSize: '1.1rem',
                        backdropFilter: 'blur(10px)'
                      }}
                      required
                    />
                  </Form.Group>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-100 py-4 mb-4 fw-bold shadow-lg border-0 fs-5"
                    style={{
                      background: 'linear-gradient(45deg, #667eea, #764ba2)',
                      borderRadius: '16px'
                    }}
                  >
                    {loading ? "Creating..." : "👨‍💼 Create Staff Account"}
                  </Button>
                </Form>

                <div className="text-center pt-4">
                  <Button
                    variant="link"
                    onClick={() => nav("/login")}
                    className="text-white opacity-75 text-decoration-none"
                  >
                    ← Back to Login
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}