const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const Material = require('../models/Material');
const mongoose = require('mongoose');

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/materials');
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.txt', '.jpg', '.png'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, PPT, TXT, JPG, PNG are allowed.'));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Upload material
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { title, description, type, subject, semester } = req.body;
    
    // Get a teacher ID from the database (use the first teacher found)
    const Teacher = mongoose.model('User');
    const teacher = await Teacher.findOne({ role: 'teacher' });
    
    if (!teacher) {
      return res.status(400).json({ error: 'No teacher found in database' });
    }
    
    const material = new Material({
      title,
      description,
      type,
      subject,
      semester,
      filename: req.file.filename,
      originalName: req.file.originalname,
      filePath: req.file.path,
      uploadedBy: teacher._id, // Use real teacher ObjectId
      uploadDate: new Date()
    });

    await material.save();
    res.status(201).json({ message: 'File uploaded successfully', material });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get materials
router.get('/', async (req, res) => {
  try {
    const { type, subject, semester } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (subject) filter.subject = subject;
    if (semester) filter.semester = semester;

    const materials = await Material.find(filter).populate('uploadedBy', 'name');
    res.json(materials);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Download material
router.get('/download/:id', async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.download(material.filePath, material.originalName);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
