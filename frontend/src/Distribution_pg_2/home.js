import React, { useState } from "react";
import Artisetlogo from "../img/Artiset_Logo.png";
import Studentmsg from "./studentmsg";
import { Search, SlidersHorizontal } from "lucide-react";
import "./home.css";
import WhatsAppIcon from "../img/whatsapp.png"; 
import EmailIcon from "../img/email.png";  
import { useNavigate } from "react-router-dom";

function Home() {
  const [showStudentMsg, setShowStudentMsg] = useState(false);
  const [notificationType, setNotificationType] = useState("");
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    navigate('/login');
  };

  return (
    <div className="home-container">
      {/* Sidebar (Fixed) */}
      <aside className="sidebar">
        <div className="logo-container">
          <img src={Artisetlogo} alt="Artiset Logo" className="logo" />
        </div>
        <ul className="nav">
          <li className="nav-item">Dashboard</li>
          <li className="nav-item">Distribution</li>
          <li className="nav-item">Homepage</li>
          <li className="nav-item">Contests</li>
          <li className="nav-item">Usermgmt</li>
        </ul>
      </aside>

      {/* Main Section */}
      <div className="main">
        {/* Navbar (Fixed) */}
        <header className="header">
          <div className="title">
            <h1>ARTISET CAMPUS</h1>
            <h2>ADMIN PANEL</h2>
          </div>
          <div className="search-bar">
            <input type="text" className="search-input" />
            <Search className="search-icon" />
          </div>
          <SlidersHorizontal className="SlidersHorizontal" />
          <button onClick={handleLogout} style={{ marginLeft: 24, padding: '8px 16px', fontSize: 16, cursor: 'pointer', borderRadius: 6, border: '1px solid #ccc', background: '#fff' }}>
            Logout
          </button>
        </header>

        {/* Content Section */}
        <div className="content">
          {showStudentMsg ? (
            <Studentmsg 
              onCancel={() => setShowStudentMsg(false)} 
              notificationType={notificationType} // Pass the notification type
            />
          ) : (
            <div className="message-container">
              <button 
                className="message-button" 
                onClick={() => {
                  setNotificationType("WhatsApp");
                  setShowStudentMsg(true);
                }}
              >
                <img src={WhatsAppIcon} alt="WhatsApp" className="message-icon" />
                <p>WhatsApp</p>
              </button>
              <button 
                className="message-button" 
                onClick={() => {
                  setNotificationType("Gmail");
                  setShowStudentMsg(true);
                }}
              >
                <img src={EmailIcon} alt="Email" className="message-icon" />
                <p>Email Notification</p>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;
