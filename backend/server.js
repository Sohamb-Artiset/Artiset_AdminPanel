require("dotenv").config();
const express = require("express");
const cors = require('cors');
const sql = require("mssql");
const sendEmail = require("./sendemail");

const app = express();
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3001',
  methods: ["POST", "GET", "PUT", "DELETE"],
  credentials: true,
  exposedHeaders: ['X-Total-Count'] // Added to expose the pagination header
}));

// SQL Server Configuration
const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  options: {
    encrypt: true,
    trustServerCertificate: false,
  },
  connectionTimeout: 30000,
};

// API to Fetch Student Data with Pagination and Total Count
app.get("/Students", async (req, res) => {
  console.log("Query Parameters:", req.query);
  try {
    await sql.connect(dbConfig);
    console.log("✅ Connected to Database");

    const page = parseInt(req.query._page) || 1;
    const limit = parseInt(req.query._limit) || 10;
    const offset = (page - 1) * limit;
    const searchTerm = req.query.q || '';
    
    console.log("Pagination values:", { page, limit, offset, searchTerm });

    let countQuery = "SELECT COUNT(*) AS count FROM Student";
    let dataQuery = `
      SELECT Fullname, College, EducationLevel, Marks, PositionApplying, EmailId 
      FROM Student 
    `;

    // Add search conditions if search term exists
    if (searchTerm) {
      const searchCondition = `
        WHERE Fullname LIKE '%${searchTerm}%' 
        OR College LIKE '%${searchTerm}%'
        OR EducationLevel LIKE '%${searchTerm}%'
        OR PositionApplying LIKE '%${searchTerm}%'
        OR EmailId LIKE '%${searchTerm}%'
      `;
      countQuery += searchCondition;
      dataQuery += searchCondition;
    }

    // Calculate total count
    // console.log("Total count query:", countQuery);
    const totalCountResult = await sql.query(countQuery);
    const totalCount = totalCountResult.recordset[0].count;
    // console.log("Total count:", totalCount);

    // Add ordering and pagination
    dataQuery += `
      ORDER BY Fullname
      OFFSET ${offset} ROWS 
      FETCH NEXT ${limit} ROWS ONLY
    `;
    // console.log("Data query:", dataQuery);

    // Fetch paginated data
    const result = await sql.query(dataQuery);
    // console.log("Fetched records count:", result.recordset.length);

    // Set X-Total-Count header
    res.setHeader('X-Total-Count', totalCount);
    // console.log("Setting X-Total-Count header to:", totalCount);

    res.json(result.recordset);
  } catch (err) {
    console.error("❌ Database error:", err);
    res.status(500).json({ error: "Database connection failed", details: err.message });
  }
});

app.post("/send-email", async (req, res) => {
  try {
    // Destructure email, subject, and body from request body
    const { email, subject, body } = req.body;

    // Log the incoming request body for debugging
    console.log("Request body:", req.body);

    // Check if all required fields are present
    if (!email || !subject || !body) {
      return res.status(400).json({ success: false, error: "Recipient email, subject, and body are required." });
    }

    // Call the sendEmail function to send the email
    const response = await sendEmail({
      recipientEmail: email,
      customSubject: subject,
      customBody: body
    });

    // Send a success response with the messageId
    res.status(200).json({ success: true, message: "Email sent successfully!", messageId: response.messageId });
  } catch (error) {
    // Send a failure response with the error message
    res.status(400).json({ success: false, error: error.message });
  }
});



// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});