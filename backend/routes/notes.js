const express = require('express');
const router = express.Router();
const Note = require('../models/Note');
const authMiddleware = require('../middleware/auth');
const {
  getNotesCache,
  setNotesCache,
  delNotesCache,
} = require('../services/cacheService');

// All routes require authentication
router.use(authMiddleware);

// @route   GET /api/notes
// @desc    Get all notes for logged-in user
// @access  Private
router.get('/', async (req, res) => {
  try {
    const cached = await getNotesCache(req.user.id);
    if (cached) {
      return res.json(cached);
    }

    const notes = await Note.find({ userId: req.user.id }).sort({ createdAt: -1 });
    const payload = { notes };
    await setNotesCache(req.user.id, notes);
    res.json(payload);
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
router.post('/', async (req, res) => {
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
    
    const newNote = new Note(noteData);
    await newNote.save();
    await delNotesCache(req.user.id);
    
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
router.put('/:id', async (req, res) => {
  try {
    const { name, link } = req.body;
    
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
    
    await note.save();
    await delNotesCache(req.user.id);

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
    
    await Note.deleteOne({ _id: req.params.id });
    await delNotesCache(req.user.id);
    
    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({ message: 'Failed to delete note' });
  }
});

module.exports = router;
