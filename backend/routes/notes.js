const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Note = require('../models/Note');
const authMiddleware = require('../middleware/auth');

// All routes require authentication
router.use(authMiddleware);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/notes');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: userId_timestamp_originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, req.user.id + '_' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Only allow PDF files
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter
  // No file size limits
});

// @route   GET /api/notes
// @desc    Get all notes for logged-in user
// @access  Private
router.get('/', async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json({ notes });
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({ message: 'Failed to retrieve notes' });
  }
});

// @route   GET /api/notes/:id
// @desc    Get a single note by ID
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const note = await Note.findOne({ 
      _id: req.params.id, 
      userId: req.user.id 
    });
    
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    
    res.json({ note });
  } catch (error) {
    console.error('Get note error:', error);
    res.status(500).json({ message: 'Failed to retrieve note' });
  }
});

// @route   POST /api/notes
// @desc    Create a new note
// @access  Private
router.post('/', upload.single('pdf'), async (req, res) => {
  try {
    const { name, link } = req.body;
    
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Note name is required' });
    }
    
    const noteData = {
      userId: req.user.id,
      name: name.trim(),
      link: link || null
    };
    
    // If a PDF was uploaded
    if (req.file) {
      noteData.pdfUrl = `/uploads/notes/${req.file.filename}`;
      noteData.pdfFileName = req.file.originalname;
    }
    
    const newNote = new Note(noteData);
    await newNote.save();
    
    res.status(201).json({ 
      message: 'Note created successfully', 
      note: newNote 
    });
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({ message: 'Failed to create note' });
  }
});

// @route   PUT /api/notes/:id
// @desc    Update a note
// @access  Private
router.put('/:id', upload.single('pdf'), async (req, res) => {
  try {
    const { name, link, removePdf } = req.body;
    
    const note = await Note.findOne({ 
      _id: req.params.id, 
      userId: req.user.id 
    });
    
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    
    // Update fields
    if (name && name.trim()) {
      note.name = name.trim();
    }
    
    if (link !== undefined) {
      note.link = link || null;
    }
    
    // Handle PDF removal
    if (removePdf === 'true' && note.pdfUrl) {
      const filePath = path.join(__dirname, '..', note.pdfUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      note.pdfUrl = null;
      note.pdfFileName = null;
    }
    
    // Handle new PDF upload
    if (req.file) {
      // Delete old PDF if exists
      if (note.pdfUrl) {
        const oldFilePath = path.join(__dirname, '..', note.pdfUrl);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }
      
      note.pdfUrl = `/uploads/notes/${req.file.filename}`;
      note.pdfFileName = req.file.originalname;
    }
    
    await note.save();
    
    res.json({ 
      message: 'Note updated successfully', 
      note 
    });
  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({ message: 'Failed to update note' });
  }
});

// @route   DELETE /api/notes/:id
// @desc    Delete a note
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const note = await Note.findOne({ 
      _id: req.params.id, 
      userId: req.user.id 
    });
    
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    
    // Delete associated PDF file if exists
    if (note.pdfUrl) {
      const filePath = path.join(__dirname, '..', note.pdfUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    await Note.deleteOne({ _id: req.params.id });
    
    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({ message: 'Failed to delete note' });
  }
});

module.exports = router;
