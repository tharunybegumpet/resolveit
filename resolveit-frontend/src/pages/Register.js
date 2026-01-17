import React, { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Form, Button, ProgressBar } from "react-bootstrap";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);
  const nav = useNavigate();

  const getPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]/)) strength++;
    if (password.match(/[A-Z]/)) strength++;
    if (password.match(/[0-9]/)) strength++;
    if (password.match(/[^a-zA-Z0-9]/)) strength++;
    return strength;
  };

  const register = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      alert("Password must be at least 8 characters long");
      return;
    }

    try {
      const res = await api.post("/api/auth/register", { name, email, password });
      
      if (res.data.success) {
        alert("Registration successful! You can now login.");
        nav("/login");
      } else {
        alert(res.data.message || "Registration failed");
      }
    } catch (err) {
      console.error("Registration error:", err);
      alert("Registration failed: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="min-vh-100 position-relative overflow-hidden">
      {/* 🔥 SAME ANIMATED GRADIENT BACKGROUND */}
      <div className="position-absolute top-0 start-0 w-100 h-100 animated-bg"></div>

      {/* Floating Particles */}
      <div className="position-absolute top-10 end-10 w-20 h-20 bg-primary bg-opacity-20 rounded-circle animate__animated animate__pulse animate__infinite" style={{ animationDelay: '0s' }}></div>
      <div className="position-absolute top-40 start-20 w-16 h-16 bg-warning bg-opacity-20 rounded-circle animate__animated animate__bounceIn animate__infinite" style={{ animationDelay: '1.5s' }}></div>
      <div className="position-absolute bottom-20 end-30 w-24 h-24 bg-success bg-opacity-15 rounded-circle animate__animated animate__fadeInUp animate__infinite" style={{ animationDelay: '0.8s' }}></div>

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
          <Col md={6} lg={5}>
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
                    <i className="bi bi-person-plus fs-1 text-white"></i>
                  </div>
                  <h2 className="fw-bold mb-2 text-white">Create Account</h2>
                  <p className="text-white opacity-90 mb-0 fs-6">Join ResolveIT today</p>
                </div>

                {/* Form */}
                <Form onSubmit={register}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold text-white mb-2 fs-6">Full Name</Form.Label>
                    <div className="input-group">
                      <span className="input-group-text bg-white bg-opacity-20 text-white border-0" style={{ borderRadius: '12px 0 0 12px' }}>
                        <i className="bi bi-person"></i>
                      </span>
                      <Form.Control
                        type="text"
                        placeholder="Enter your full name"
                        value={name}
                        onChange={e=>setName(e.target.value)}
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
                    <Form.Label className="fw-semibold text-white mb-2 fs-6">Email Address</Form.Label>
                    <div className="input-group">
                      <span className="input-group-text bg-white bg-opacity-20 text-white border-0" style={{ borderRadius: '12px 0 0 12px' }}>
                        <i className="bi bi-envelope"></i>
                      </span>
                      <Form.Control
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={e=>setEmail(e.target.value)}
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
                        placeholder="Create strong password"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setPasswordStrength(getPasswordStrength(e.target.value));
                        }}
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
                    {/* Password Strength Bar */}
                    {password && (
                      <div className="mt-2">
                        <ProgressBar
                          now={passwordStrength * 20}
                          className="shadow-sm"
                          style={{ height: '6px', borderRadius: '3px' }}
                          variant={passwordStrength >= 4 ? "success" : passwordStrength >= 3 ? "warning" : "danger"}
                        />
                        <small className={`text-white mt-1 d-block ${
                          passwordStrength >= 4 ? "text-success" :
                          passwordStrength >= 3 ? "text-warning" : "text-danger"
                        }`}>
                          {passwordStrength >= 4 ? "Strong" : passwordStrength >= 3 ? "Medium" : "Weak"}
                        </small>
                      </div>
                    )}
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold text-white mb-2 fs-6">Confirm Password</Form.Label>
                    <div className="input-group">
                      <span className="input-group-text bg-white bg-opacity-20 text-white border-0" style={{ borderRadius: '12px 0 0 12px' }}>
                        <i className="bi bi-lock"></i>
                      </span>
                      <Form.Control
                        type="password"
                        placeholder="Confirm your password"
                        value={confirmPassword}
                        onChange={e=>setConfirmPassword(e.target.value)}
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
                    <i className="bi bi-person-plus me-2"></i>
                    Create Account
                  </Button>
                </Form>

                {/* Back to Login */}
                <div className="text-center pt-4">
                  <Button
                    variant="outline-light"
                    size="lg"
                    onClick={() => nav("/login")}
                    className="w-100 py-3 fw-semibold shadow-lg border-3"
                    style={{
                      borderRadius: '16px',
                      backdropFilter: 'blur(10px)',
                      borderColor: 'rgba(255, 255, 255, 0.4)'
                    }}
                  >
                    <i className="bi bi-arrow-left me-2"></i>
                    Back to Login
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
