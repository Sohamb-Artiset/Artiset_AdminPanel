import React, { useState, useEffect } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import "./Studentmsg.css";
import Checkbox from '@mui/material/Checkbox';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import ConfirmationDialog from './ConfirmationDialog'; 

function Studentmsg({ onCancel, notificationType }) {
  const [students, setStudents] = useState([]);
  const [open, setOpen] = useState(false);
  const [message, setMsg] = useState("");
  const [subject, setSubject] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Fetch student data from backend
  useEffect(() => {
    fetch("http://localhost:3000/Students")
      .then(response => response.json())
      .then(data => {
        if (!Array.isArray(data)) {
          // console.error("❌ Expected an array but got:", data);
          return;
        }
        const studentsWithCheckbox = data.map(student => ({
          name: student.Fullname,
          college: student.College,
          year: student.EducationLevel,
          cgpa: student.Marks,
          role: student.PositionApplying,
          email: student.EmailId,
          checked: false,
        }));
        setStudents(studentsWithCheckbox);
      })
      .catch(error => console.error("❌ Error fetching student data:", error));
  }, []);

  const handleSelectAll = (event) => {
    const allChecked = event.target.checked;
    setStudents(students.map(student => ({ ...student, checked: allChecked })));
  };

  const handleStudentSelect = (email, event) => {
    setStudents(students.map(student =>
      student.email === email ? { ...student, checked: event.target.checked } : student
    ));
  };

  const handleSend = () => {
    const selectedEmails = students.filter(student => student.checked).map(student => student.email);
    const msg = document.querySelector('.message-box:first-of-type').value;
    const subject = document.querySelector('.message-box:nth-of-type(2)').value;
    
    setMsg(msg);
    setSubject(subject);
    
    if (selectedEmails.length === 0) {
      alert('Please select students to send the email to.');
      return;
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleConfirm = async () => {
    const selectedEmails = students.filter(student => student.checked).map(student => student.email);
  
    if (selectedEmails.length === 0) {
      alert("Please select at least one student to send the email.");
      return;
    }

    setIsLoading(true);
  
    try {
      const response = await fetch("http://localhost:3000/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: selectedEmails,
          subject: subject,
          body: message,
        }),
      });
  
      const responseData = await response.json();
  
      if (response.ok) {
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 2000);
      } else {
        alert("Failed to send emails: " + responseData.error);
      }
  
      setOpen(false);
    } catch (error) {
      alert("Error sending email: " + error.message);
    } finally {
      setIsLoading(false);
      setOpen(false);
    }
  };

  return (
    <div className="main-content">
      {isLoading && (
        <div className="loader-overlay">
          <div className="loader1"></div>
          <p className="loading-text">Sending Emails...</p>
        </div>
      )}
      {showSuccessMessage && (
        <div className="success-message">
          {notificationType} messages sent successfully!
        </div>
      )}
      <div className="message-section">
        <div className="message-header">What Message do you want to send?</div>
        <textarea className="message-box" placeholder="Write your message here..."></textarea>
        <textarea className="message-box" placeholder="Write your subject here..."></textarea>
        <br />
        <select className="reference-dropdown">
          <option value="" disabled >Select Reference for the notification</option>
          <option value="option1">Option 1</option>
          <option value="option2">Option 2</option>
        </select>
        <div className="button-group">
          <button className="cancel-button" onClick={onCancel}>CANCEL</button>
          <button className="send-button" onClick={handleSend}>SEND</button>
        </div>
      </div>

      <div className="student-section">
        <div className="student-header">SELECT STUDENTS TO SEND THE NOTIFICATION</div>
        <div className="select-all-container">
          <div className="select-all">
            <input type="checkbox" id="select-all" onChange={handleSelectAll} checked={students.every(student => student.checked)} />
            <label htmlFor="select-all">SELECT_ALL</label>
          </div>
          <div className="search-container">
            <div className="search-bar">
              <input type="text" className="search-input" placeholder="Search..." />
              <Search className="search-icon" />
            </div>
            <SlidersHorizontal className="SlidersHorizontal" />
          </div>
        </div>
        <div className="student-list">
          {students.map(student => (
            <StudentCard 
              key={student.email} 
              {...student} 
              onSelect={handleStudentSelect} 
            />
          ))}
        </div>
      </div>

      <ConfirmationDialog
        open={open}
        onClose={handleClose}
        onConfirm={handleConfirm}
        header={notificationType === "WhatsApp" ? "Sending Notification via WhatsApp:" : "Sending Notification via Gmail:"}
        message={message}
        subject={subject}
      />
    </div>
  );
}

const StudentCard = ({ name, college, year, cgpa, role, email, checked, onSelect }) => {
  return (
    <div className="student-card">
      <FormGroup>
        <FormControlLabel 
          control={<Checkbox checked={checked} onChange={(event) => onSelect(email, event)} />} 
          label="" 
        />
      </FormGroup>
      <p><strong>Name:</strong> {name}</p>
      <p><strong>College:</strong> {college}</p>
      <p><strong>Year:</strong> {year}</p>
      <p><strong>CGPA:</strong> {cgpa}</p>
      <p><strong>Role:</strong> {role}</p>
      <p><strong>Email:</strong> {email}</p>
    </div>
  );
};

export default Studentmsg;
