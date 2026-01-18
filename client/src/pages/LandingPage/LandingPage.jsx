import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  return (
    <>
      <div className="container">
        <div className="text">NEXORA</div>
        <div className="visit">
          <Link to="/home">Visit Site</Link>
        </div>
        <div className="landing-login">
          <Link to="/login">Login</Link>
        </div>
      </div>
    </>
  );
};

export default LandingPage;