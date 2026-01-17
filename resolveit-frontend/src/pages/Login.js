import React, { useState, useContext } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { Container, Row, Col, Card, Form, Button } from "react-bootstrap";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login: saveAuth } = useContext(AuthContext);
  const nav = useNavigate();

  const login = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/api/auth/login", { email, password });

      if (res.data.status === "success") {
        saveAuth(res.data.token, res.data.user);
        
        // 🔥 4-ROLE LOGIN REDIRECT
        if (res.data.user.role === "ADMIN") {
          nav("/admin"); // Admin dashboard
        } else if (res.data.user.role === "MANAGER") {
          nav("/manager"); // Manager dashboard
        } else if (res.data.user.role === "STAFF") {
          nav("/staff"); // Staff dashboard
        } else {
          nav("/dashboard"); // User dashboard
        }
      } else {
        alert(res.data.message);
      }
    } catch (err) {
      alert("Login Failed");
    }
  };

  return (
    <div className="min-vh-100 position-relative overflow-hidden">
      {/* 🔥 ANIMATED GRADIENT BACKGROUND */}
      <div className="position-absolute top-0 start-0 w-100 h-100 animated-bg"></div>

      {/* Floating Particles */}
      <div className="position-absolute top-10 start-10 w-20 h-20 bg-primary bg-opacity-20 rounded-circle animate__animated animate__pulse animate__infinite" style={{ animationDelay: '0s' }}></div>
      <div className="position-absolute top-50 end-20 w-16 h-16 bg-warning bg-opacity-20 rounded-circle animate__animated animate__bounceIn animate__infinite" style={{ animationDelay: '2s' }}></div>
      <div className="position-absolute bottom-20 start-20 w-24 h-24 bg-success bg-opacity-15 rounded-circle animate__animated animate__fadeInUp animate__infinite" style={{ animationDelay: '1s' }}></div>

      <style jsx>{`
        .animated-bg {
          background: linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab);
          background-size: 400% 400%;
          animation: gradientShift 15s ease infinite;
        }
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>

      <Container className="py-5 position-relative z-2">
        <Row className="justify-content-center">
          <Col md={5} lg={4}>
            <Card className="shadow-xl border-0 glass-card" style={{
              background: 'rgba(255, 255, 255, 0.25)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderRadius: '24px',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <Card.Body className="p-4 p-md-5">
                {/* Header */}
                <div className="text-center mb-5">
                  <div className="bg-white bg-opacity-20 rounded-circle mx-auto mb-4 d-flex align-items-center justify-content-center shadow-lg" style={{width: '90px', height: '90px'}}>
                    <i className="bi bi-shield-check fs-1 text-white"></i>
                  </div>
                  <h2 className="fw-bold mb-2 text-white">Welcome Back</h2>
                  <p className="text-white opacity-90 mb-0 fs-6">Sign in to your ResolveIT account</p>
                </div>

                {/* Form */}
                <Form onSubmit={login}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold text-white mb-2 fs-6">Email Address</Form.Label>
                    <div className="input-group">
                      <span className="input-group-text bg-white bg-opacity-20 text-white border-0" style={{ borderRadius: '12px 0 0 12px' }}>
                        <i className="bi bi-envelope"></i>
                      </span>
                      <Form.Control
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="py-3 shadow-none border-0 text-white"
                        style={{
                          background: 'rgba(255, 255, 255, 0.1)',
                          borderRadius: '0 12px 12px 0',
                          fontSize: '1.1rem',
                          backdropFilter: 'blur(10px)'
                        }}
                        required
                      />
                    </div>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold text-white mb-2 fs-6">Password</Form.Label>
                    <div className="input-group">
                      <span className="input-group-text bg-white bg-opacity-20 text-white border-0" style={{ borderRadius: '12px 0 0 12px' }}>
                        <i className="bi bi-lock"></i>
                      </span>
                      <Form.Control
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="py-3 shadow-none border-0 text-white"
                        style={{
                          background: 'rgba(255, 255, 255, 0.1)',
                          borderRadius: '0 12px 12px 0',
                          fontSize: '1.1rem',
                          backdropFilter: 'blur(10px)'
                        }}
                        required
                      />
                    </div>
                  </Form.Group>

                  <Button
                    type="submit"
                    className="w-100 py-4 mb-4 fw-bold shadow-lg border-0 fs-5 position-relative overflow-hidden"
                    style={{
                      background: 'linear-gradient(45deg, #ff6b6b, #feca57)',
                      borderRadius: '16px',
                      fontWeight: '700'
                    }}
                  >
                    <i className="bi bi-arrow-right me-2"></i>
                    Sign In Securely
                  </Button>
                </Form>

                {/* Register */}
                <div className="text-center pt-4">
                  <p className="text-white opacity-75 mb-3 fs-6">New to ResolveIT?</p>
                  <Button
                    variant="outline-light"
                    size="lg"
                    onClick={() => nav("/register-select")}
                    className="w-100 py-3 fw-semibold shadow-lg border-3"
                    style={{
                      borderRadius: '16px',
                      backdropFilter: 'blur(10px)',
                      borderColor: 'rgba(255, 255, 255, 0.4)'
                    }}
                  >
                    <i className="bi bi-person-plus me-2"></i>
                    Create New Account
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
