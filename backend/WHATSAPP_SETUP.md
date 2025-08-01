# WhatsApp API Setup Guide

## Prerequisites

1. **Twilio Account**: Sign up for a Twilio account at https://www.twilio.com
2. **WhatsApp Business API**: Enable WhatsApp Business API in your Twilio console
3. **Phone Number**: Get a WhatsApp-enabled phone number from Twilio

## Environment Variables

Add the following variables to your `.env` file:

```env
# WhatsApp Configuration (Twilio)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_WHATSAPP_NUMBER=your_twilio_whatsapp_number
```

## Setup Steps

### 1. Get Twilio Credentials
1. Log into your Twilio Console
2. Go to Dashboard → Account Info
3. Copy your Account SID and Auth Token

### 2. Get WhatsApp Number
1. In Twilio Console, go to Phone Numbers → Manage → Active numbers
2. Buy a new number or use existing number
3. Enable WhatsApp capability for the number
4. Copy the phone number (without country code prefix)

### 3. Install Dependencies
```bash
npm install twilio
```

### 4. Database Setup
Make sure your Student table has a `PhoneNumber` column:
```sql
ALTER TABLE Student ADD PhoneNumber VARCHAR(20);
```

## Complete Implementation

### Backend Changes

#### 1. Update package.json
```json
{
  "dependencies": {
    "@azure/communication-email": "^1.0.0",
    "cors": "^2.8.5",
    "dotenv": "^16.4.7",
    "express": "^4.21.2",
    "mssql": "^11.0.1",
    "twilio": "^4.22.0"
  }
}
```

#### 2. Create sendwhatsapp.js
```javascript
const twilio = require('twilio');

// Initialize Twilio client
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const sendWhatsApp = async ({ recipientPhone, customBody }) => {
  try {
    // Validate input parameters
    if (!recipientPhone || !customBody) {
      throw new Error('Recipient phone number and message body are required.');
    }

    // Format phone number (remove any non-digit characters and ensure it starts with country code)
    let formattedPhone = recipientPhone.replace(/\D/g, '');
    
    // If phone number doesn't start with country code, assume it's a US number
    if (!formattedPhone.startsWith('1') && formattedPhone.length === 10) {
      formattedPhone = '1' + formattedPhone;
    }
    
    // Add WhatsApp: prefix for Twilio
    const whatsappNumber = `whatsapp:+${formattedPhone}`;
    const fromNumber = `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`;

    console.log(`📱 Sending WhatsApp message to: ${whatsappNumber}`);
    console.log(`📱 From: ${fromNumber}`);
    console.log(`📱 Message: ${customBody}`);

    // Send WhatsApp message using Twilio
    const message = await client.messages.create({
      body: customBody,
      from: fromNumber,
      to: whatsappNumber
    });

    console.log(`✅ WhatsApp message sent successfully! SID: ${message.sid}`);
    
    return {
      success: true,
      messageId: message.sid,
      status: message.status,
      to: recipientPhone
    };

  } catch (error) {
    console.error('❌ Error sending WhatsApp message:', error);
    throw new Error(`Failed to send WhatsApp message: ${error.message}`);
  }
};

module.exports = sendWhatsApp;
```

#### 3. Update server.js
Add the import at the top:
```javascript
const sendWhatsApp = require("./sendwhatsapp");
```

Update the database query to include phone numbers:
```javascript
let dataQuery = `
  SELECT Fullname, College, EducationLevel, Marks, PositionApplying, EmailId, PhoneNumber 
  FROM Student 
`;
```

Add phone number to search functionality:
```javascript
const searchCondition = `
  WHERE Fullname LIKE '%${searchTerm}%' 
  OR College LIKE '%${searchTerm}%'
  OR EducationLevel LIKE '%${searchTerm}%'
  OR PositionApplying LIKE '%${searchTerm}%'
  OR EmailId LIKE '%${searchTerm}%'
  OR PhoneNumber LIKE '%${searchTerm}%'
`;
```

Add the WhatsApp endpoint:
```javascript
app.post("/send-whatsapp", async (req, res) => {
  try {
    // Destructure phone and body from request body
    const { phone, body } = req.body;

    // Log the incoming request body for debugging
    console.log("WhatsApp request body:", req.body);

    // Check if all required fields are present
    if (!phone || !body) {
      return res.status(400).json({ success: false, error: "Recipient phone number and message body are required." });
    }

    // Call the sendWhatsApp function to send the message
    const response = await sendWhatsApp({
      recipientPhone: phone,
      customBody: body
    });

    // Send a success response with the messageId
    res.status(200).json({ success: true, message: "WhatsApp message sent successfully!", messageId: response.messageId });
  } catch (error) {
    // Send a failure response with the error message
    res.status(400).json({ success: false, error: error.message });
  }
});
```

### Frontend Changes

#### 1. Update studentmsg.js

Add phone number to student data mapping:
```javascript
const studentsWithCheckbox = data.map(student => ({
  name: student.Fullname,
  college: student.College,
  year: student.EducationLevel,
  cgpa: student.Marks,
  role: student.PositionApplying,
  email: student.EmailId,
  phone: student.PhoneNumber || '', // Add phone number field
  checked: false,
}));
```

Update the handleConfirm function:
```javascript
const handleConfirm = async () => {
  const selectedStudents = students.filter(student => student.checked);

  if (selectedStudents.length === 0) {
    alert("Please select at least one student to send the notification.");
    return;
  }

  setIsLoading(true);

  try {
    if (notificationType === "WhatsApp") {
      // Send WhatsApp messages
      const whatsappPromises = selectedStudents
        .filter(student => student.phone) // Only send to students with phone numbers
        .map(student => 
          fetch("http://localhost:3000/send-whatsapp", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              phone: student.phone,
              body: message,
            }),
          })
        );

      const responses = await Promise.all(whatsappPromises);
      const results = await Promise.all(responses.map(res => res.json()));

      const successCount = results.filter(result => result.success).length;
      const totalAttempted = whatsappPromises.length;

      if (totalAttempted > 0) {
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 2000);
        
        if (successCount < totalAttempted) {
          alert(`WhatsApp messages sent: ${successCount}/${totalAttempted} successful`);
        }
      } else {
        alert("No students have phone numbers to send WhatsApp messages to.");
      }
    } else {
      // Send email messages
      const selectedEmails = selectedStudents.map(student => student.email);
      
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
    }

    setOpen(false);
  } catch (error) {
    alert(`Error sending ${notificationType} messages: ` + error.message);
  } finally {
    setIsLoading(false);
    setOpen(false);
  }
};
```

Update loading text:
```javascript
{isLoading && (
  <div className="loader-overlay">
    <div className="loader1"></div>
    <p className="loading-text">Sending {notificationType} messages...</p>
  </div>
)}
```

Update message header:
```javascript
<div className="message-header">What Message do you want to send via {notificationType}?</div>
```

Conditionally show subject field:
```javascript
<textarea className="message-box" placeholder="Write your message here..."></textarea>
{notificationType === "Email" && (
  <textarea className="message-box" placeholder="Write your subject here..."></textarea>
)}
```

Update handleSend function:
```javascript
const handleSend = () => {
  const selectedStudents = students.filter(student => student.checked);
  const msg = document.querySelector('.message-box:first-of-type').value;
  const subject = notificationType === "Email" ? document.querySelector('.message-box:nth-of-type(2)').value : "";

  setMsg(msg);
  setSubject(subject);

  if (selectedStudents.length === 0) {
    alert(`Please select students to send the ${notificationType.toLowerCase()} to.`);
    return;
  }
  setOpen(true);
};
```

Update StudentCard component:
```javascript
const StudentCard = ({ name, college, year, cgpa, role, email, phone, checked, onSelect }) => {
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
      {phone && <p><strong>Phone:</strong> {phone}</p>}
    </div>
  );
};
```

## Usage

The WhatsApp API is now integrated with your existing notification system. When you select "WhatsApp" as the notification type, the system will:

1. Filter students who have phone numbers
2. Send WhatsApp messages to selected students
3. Show success/failure counts

## API Endpoints

- `POST /send-whatsapp` - Send WhatsApp message
  - Body: `{ "phone": "1234567890", "body": "Your message" }`

## Key Features

- **Dual Support**: Works with both Email and WhatsApp notifications
- **Phone Validation**: Only sends WhatsApp to students with phone numbers
- **Error Handling**: Comprehensive error handling and user feedback
- **Batch Processing**: Can send to multiple students simultaneously
- **Smart Filtering**: Automatically filters students based on available contact info
- **Conditional UI**: Subject field only shows for email notifications
- **Dynamic Loading**: Loading text changes based on notification type

## Notes

- Phone numbers should include country code (e.g., +1 for US)
- The system automatically formats phone numbers for WhatsApp
- Only students with valid phone numbers will receive WhatsApp messages
- WhatsApp messages don't have subjects like emails, only message body
- The integration is seamless and maintains existing UI/UX 