import React, { useState } from 'react';
import axios from 'axios';

const AdminRegister = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await axios.post('http://localhost:8080/auth/create-admin', formData);
      
      if (response.data.status === 'success') {
        setMessage('✅ Admin user created successfully! You can now login.');
        setFormData({ name: '', email: '', password: '' });
      } else {
        setMessage('❌ ' + response.data.message);
      }
    } catch (error) {
      setMessage('❌ Error creating admin user: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      maxWidth: '400px', 
      margin: '50px auto', 
      padding: '20px',
      border: '1px solid #ddd',
      borderRadius: '8px',
      backgroundColor: '#f9f9f9'
    }}>
      <h2 style={{ textAlign: 'center', color: '#333' }}>🔐 Create Admin User</h2>
      
      {message && (
        <div style={{ 
          padding: '10px', 
          marginBottom: '15px',
          borderRadius: '4px',
          backgroundColor: message.includes('✅') ? '#d4edda' : '#f8d7da',
          color: message.includes('✅') ? '#155724' : '#721c24',
          border: `1px solid ${message.includes('✅') ? '#c3e6cb' : '#f5c6cb'}`
        }}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label>Full Name:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            style={{ 
              width: '100%', 
              padding: '8px', 
              marginTop: '5px',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            style={{ 
              width: '100%', 
              padding: '8px', 
              marginTop: '5px',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label>Password:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            style={{ 
              width: '100%', 
              padding: '8px', 
              marginTop: '5px',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? 'Creating...' : 'Create Admin User'}
        </button>
      </form>

      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <a href="/login" style={{ color: '#007bff', textDecoration: 'none' }}>
          ← Back to Login
        </a>
      </div>
    </div>
  );
};

export default AdminRegister;