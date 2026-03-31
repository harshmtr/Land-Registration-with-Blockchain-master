import React from 'react';
import { Link } from 'react-router-dom';

export default function Help() {
  return (
    <div className="auth-wrapper">
      <div className="auth-inner" style={{ marginTop: '80px', maxWidth: '600px' }}>
        <Link to="/" style={{ display: 'inline-block', marginBottom: '20px' }}>
          <button className="btn btn-secondary">← Back</button>
        </Link>
        
        <h1>Help & Support</h1>
        
        <div style={{ marginTop: '24px', textAlign: 'left' }}>
          <h3>Getting Started</h3>
          <p>
            Welcome to the Land Registration system. This application helps you manage land property transactions securely using blockchain technology.
          </p>
          
          <h3 style={{ marginTop: '24px' }}>Roles</h3>
          <ul style={{ marginLeft: '20px', lineHeight: '1.8' }}>
            <li><strong>Buyer</strong>: Browse and request land properties for purchase</li>
            <li><strong>Seller</strong>: List and manage land properties for sale</li>
            <li><strong>Land Inspector</strong>: Verify and approve land transaction requests</li>
          </ul>
          
          <h3 style={{ marginTop: '24px' }}>Getting Help</h3>
          <p>
            If you encounter any issues or have questions, please contact the system administrator or refer to the documentation.
          </p>
          
          <h3 style={{ marginTop: '24px' }}>Security</h3>
          <p>
            This application uses MetaMask for secure authentication. Make sure you have MetaMask installed and configured before proceeding.
          </p>
        </div>
      </div>
    </div>
  );
}
