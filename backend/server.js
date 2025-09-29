require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ===== MONGODB CONNECTION WITH EXACT STRING =====
console.log('🔗 Using EXACT MongoDB connection string...');
console.log('String:', process.env.MONGODB_URI.replace(/:[^:]*@/, ':********@'));

const connectDB = async () => {
  try {
    // Use the exact connection string from .env
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 15000,
    });
    
    console.log('✅ MongoDB Connected Successfully!');
    console.log('📊 Database:', mongoose.connection.db.databaseName);
    
  } catch (error) {
    console.log('❌ MongoDB Connection Failed:');
    console.log('Error:', error.message);
    console.log('\n💡 Please check:');
    console.log('1. Network Access in MongoDB Atlas');
    console.log('2. Password in .env file');
    console.log('3. Exact connection string format');
    process.exit(1); // Stop server if MongoDB fails
  }
};

// Initialize connection
connectDB();

// ===== DATABASE MODELS =====
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['teacher', 'student'], required: true },
  rollNo: { type: String },
  division: { type: String, enum: ['I', 'II'] },
  course: { type: String, default: 'Computer Science and Engineering' },
  subject: { type: String },
  department: { type: String, default: 'CSE' }
}, { timestamps: true });

const attendanceSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  status: { type: String, enum: ['present', 'absent'], required: true },
  subject: { type: String, required: false },
  department: { type: String, default: 'CSE' }
}, { timestamps: true });

// Subjects
const subjectSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  teacherName: { type: String },
  department: { type: String, default: 'CSE' }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Attendance = mongoose.model('Attendance', attendanceSchema);
const Subject = mongoose.model('Subject', subjectSchema);

// Import routes
const materialRoutes = require('./routes/materialRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');

// ===== AUTH ROUTES =====
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // If passwords are stored in plain text (from setup), allow direct compare; otherwise bcrypt compare
    let isMatch = false;
    if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
      isMatch = await bcrypt.compare(password, user.password);
    } else {
      isMatch = password === user.password;
    }

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '7d' });
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        rollNo: user.rollNo,
        division: user.division,
        course: user.course,
      },
      token
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ===== STUDENT ROUTES =====
app.get('/api/students', async (req, res) => {
  try {
    const { division } = req.query;
    const query = { role: 'student' };
    if (division) query.division = division;
    const students = await User.find(query).sort({ rollNo: 1 });
    res.json({ success: true, students });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to fetch students' });
  }
});

app.post('/api/students', async (req, res) => {
  try {
    const { name, email, rollNo, division, course, password } = req.body;
    const exists = await User.findOne({ $or: [{ email }, { rollNo }] });
    if (exists) return res.status(400).json({ success: false, message: 'Student already exists' });
    const user = new User({ name, email, rollNo, division, course, role: 'student', password: password || 'student123' });
    await user.save();
    res.status(201).json({ success: true, student: user });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to add student' });
  }
});

// ===== ATTENDANCE ROUTES =====
// Mark attendance for a specific date
app.post('/api/attendance/mark', async (req, res) => {
  try {
    const { date, attendanceData, subject } = req.body;
    if (!date || !Array.isArray(attendanceData)) {
      return res.status(400).json({ success: false, message: 'Invalid payload' });
    }

    const targetDateStart = new Date(date);
    targetDateStart.setHours(0, 0, 0, 0);
    const targetDateEnd = new Date(targetDateStart);
    targetDateEnd.setDate(targetDateEnd.getDate() + 1);

    const ops = attendanceData.map(({ studentId, status }) =>
      Attendance.findOneAndUpdate(
        { studentId, date: { $gte: targetDateStart, $lt: targetDateEnd } },
        { $set: { studentId, status, date: targetDateStart, subject } },
        { upsert: true, new: true }
      )
    );

    await Promise.all(ops);
    res.json({ success: true, message: 'Attendance saved' });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to mark attendance' });
  }
});

// ===== SUBJECT ROUTES =====
app.get('/api/subjects', async (req, res) => {
  try {
    const subjects = await Subject.find().sort({ name: 1 });
    res.json({ success: true, subjects });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to fetch subjects' });
  }
});

// Get attendance records with optional filters
app.get('/api/attendance/records', async (req, res) => {
  try {
    const { studentId, from, to, subject } = req.query;
    const query = {};
    if (studentId) query.studentId = studentId;
    if (subject) query.subject = subject;
    if (from || to) {
      query.date = {};
      if (from) query.date.$gte = new Date(new Date(from).setHours(0,0,0,0));
      if (to) query.date.$lte = new Date(new Date(to).setHours(23,59,59,999));
    }
    const attendance = await Attendance.find(query).sort({ date: -1 });
    res.json({ success: true, attendance });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to fetch attendance' });
  }
});

// Get attendance stats for a student
app.get('/api/attendance/stats/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const { subject } = req.query;
    const query = { studentId };
    if (subject) query.subject = subject;
    const records = await Attendance.find(query);
    const totalDays = records.length;
    const presentDays = records.filter(r => r.status === 'present').length;
    const absentDays = totalDays - presentDays;
    const percentage = totalDays ? Math.round((presentDays / totalDays) * 100) : 0;
    res.json({ success: true, stats: { totalDays, presentDays, absentDays, percentage } });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to fetch stats' });
  }
});

// Optional: hash passwords for existing users created by setup on first run
app.post('/api/auth/hash-existing', async (req, res) => {
  try {
    const users = await User.find();
    let updated = 0;
    for (const u of users) {
      if (!u.password.startsWith('$2a$') && !u.password.startsWith('$2b$')) {
        u.password = await bcrypt.hash(u.password, 10);
        await u.save();
        updated++;
      }
    }
    res.json({ success: true, updated });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Hashing failed' });
  }
});

// ===== INITIAL SETUP ROUTE =====
app.get('/api/setup', async (req, res) => {
  try {
    console.log('🔄 Running initial setup...');
    
    // Create department teachers (TR logins)
    const deptTeachers = [
      { name: 'Dr Sagar Mohite', email: 'sagar.mohite@cse.pune', password: 'teacher123', role: 'teacher', department: 'CSE', subject: 'Internet of Things' },
      { name: 'Dr Shilpa Bhosale', email: 'shilpa.bhosale@cse.pune', password: 'teacher123', role: 'teacher', department: 'CSE', subject: 'Design and Analysis of Algorithm' },
      { name: 'Design Thinking', email: 'design.thinking@cse.pune', password: 'teacher123', role: 'teacher', department: 'CSE', subject: 'Design Thinking' },
      { name: 'Prof. Trupti Suryawanshi', email: 'trupti.suryawanshi@cse.pune', password: 'teacher123', role: 'teacher', department: 'CSE', subject: 'Software Testing and Quality Assurance' },
      { name: 'Vrushali Patil', email: 'vrushali.patil@cse.pune', password: 'teacher123', role: 'teacher', department: 'CSE', subject: 'Artificial Intelligence' },
    ];

    for (const t of deptTeachers) {
      const exists = await User.findOne({ email: t.email });
      if (!exists) {
        await new User(t).save();
        console.log(`✅ Teacher created: ${t.name} (${t.subject})`);
      }
    }
    
    // Sample students from your Excel file
    const sampleStudents = [
      { name: 'AYUSH ADITYA', email: 'aditya100ayush@gmail.com', rollNo: '1', division: 'I' },
      { name: 'MANAN AGARWAL', email: 'manan.agarwal1403@gmail.com', rollNo: '2', division: 'I' },
      { name: 'SOMIL AGRAWAL', email: 'somilagrawalsatna2020@gmail.com', rollNo: '3', division: 'I' },
      { name: 'SIMAR AHLUWALIA', email: '77munishwalia@gmail.com', rollNo: '4', division: 'I' },
    ];
    
    let createdCount = 0;
    for (const studentData of sampleStudents) {
      const exists = await User.findOne({ 
        $or: [
          { email: studentData.email },
          { rollNo: studentData.rollNo }
        ] 
      });
      
      if (!exists) {
        const student = new User({
          ...studentData,
          password: 'student123',
          role: 'student'
        });
        await student.save();
        createdCount++;
        console.log(`✅ Student created: ${studentData.name}`);
      }
    }
    
    // Seed subjects collection
    const subjects = [
      { name: 'Internet of Things', teacherName: 'Dr Sagar Mohite', department: 'CSE' },
      { name: 'Design and Analysis of Algorithm', teacherName: 'Dr Shilpa Bhosale', department: 'CSE' },
      { name: 'Design Thinking', teacherName: 'CSE Department', department: 'CSE' },
      { name: 'Software Testing and Quality Assurance', teacherName: 'Prof. Trupti Suryawanshi', department: 'CSE' },
      { name: 'Artificial Intelligence', teacherName: 'Vrushali Patil', department: 'CSE' },
    ];
    for (const s of subjects) {
      const exists = await Subject.findOne({ name: s.name });
      if (!exists) await new Subject(s).save();
    }

    res.json({
      success: true,
      message: `Setup completed! Created ${createdCount} students and ensured subjects/teachers.`,
      credentials: {
        departmentTeachers: deptTeachers.map(t => `${t.email} / teacher123`),
        students: 'Use student emails with password: student123'
      }
    });
    
  } catch (error) {
    res.json({
      success: false,
      message: 'Setup failed: ' + error.message
    });
  }
});

// ===== TEST ROUTE =====
app.get('/api/test', async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    
    res.json({ 
      message: '🎉 CSE Attendance System with MongoDB!',
      database: {
        status: 'Connected ✅',
        users: userCount,
        connection: 'Using exact MongoDB connection string'
      }
    });
    
  } catch (error) {
    res.json({
      message: 'System running but database error',
      error: error.message
    });
  }
});

// ===== HEALTH CHECK =====
app.get('/api/health', (req, res) => {
  res.json({ 
    status: mongoose.connection.readyState === 1 ? '✅ Healthy' : '⚠️ Database Issue',
    mongodb: {
      connected: mongoose.connection.readyState === 1,
      state: mongoose.connection.readyState,
      host: mongoose.connection.host
    },
    timestamp: new Date().toISOString()
  });
});

// Add new routes
app.use('/api/materials', materialRoutes);
app.use('/api/chatbot', chatbotRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('🎉 ====================================');
  console.log('🚀 CSE ATTENDANCE SYSTEM STARTED!');
  console.log('💾 Using EXACT MongoDB connection string');
  console.log(`📍 Server running on port ${PORT}`);
  console.log('🌐 Frontend: http://localhost:3000');
  console.log('📁 File uploads: http://localhost:5000/uploads');
  console.log('🎉 ====================================');
  console.log('💡 Run http://localhost:5000/api/setup to initialize data');
  console.log('🎉 ====================================');
});