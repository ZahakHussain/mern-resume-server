const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors({
  origin: "https://mern-resume-client.netlify.app",  // ✅ Replaced with  actual Netlify frontend domain
  credentials: true,
}));
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Resume model
const Resume = require("./models/Resume");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("./models/User");

// Middleware to check token
function authMiddleware(req, res, next) {
  const token = req.headers.authorization;

  if (!token) return res.status(401).json({ message: "Access denied. No token." });

  try {
    const decoded = jwt.verify(token, "secretkey");
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token." });
  }
}

// Register route
app.post("/api/register", async (req, res) => {
  console.log("Register request:", req.body); // 🔍 log
  const { email, password } = req.body; 

  if (!email || !password) return res.status(400).json({ message: "Email and password are required" });

  const existingUser = await User.findOne({ email });
  if (existingUser) return res.status(400).json({ message: "User already exists" })
    // navigate("/login");


  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ email, password: hashedPassword });
  await user.save();

  res.json({ message: "User registered" });
});

// Login route
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

  const token = jwt.sign({ userId: user._id, email: user.email }, "secretkey", { expiresIn: "1h" });
  res.json({ token });
});


// API routes
app.get("/api/resumes", authMiddleware, async (req, res) => {
  const userId = req.user.userId; // From token
  const resumes = await Resume.find( {userId} ); // (Optional: filter by req.user.userId)
  res.json(resumes);
});

app.post("/api/resumes", authMiddleware, async (req, res) => {
  const resume = new Resume({ ...req.body, userId : req.user.userId}); // Attach user ID
  await resume.save();
  res.json(resume);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));