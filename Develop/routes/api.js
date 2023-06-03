const express = require('express');
const router = express.Router();
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const dbPath = '../db/db.json';

// Instead of importing the notes from the JSON file, use a function to read the file and return the parsed JSON object
function getNotes() {
    const data = fs.readFileSync(dbPath);
    return JSON.parse(data);
}

// Instead of writing to the file in each request handler, use a function to write to the file with the provided notes
function saveNotes(notes) {
    const notesString = JSON.stringify(notes, null, 3);
    fs.writeFileSync(dbPath, notesString);
}

// GET /api/notes (return db.json)
router.get('/notes', (req, res) => {
    const notes = getNotes();
    res.json(notes);
});

// POST /api/notes (return new note, add to db.json, return to client, give note unique ID when saved)
router.post('/notes', (req, res) => {
    const { title, text } = req.body;

    if (title && text) {
        const newNote = { title, text, id: uuidv4() };
        const notes = getNotes();
        notes.push(newNote);
        saveNotes(notes);
        const response = { status: 'success', body: newNote };
        res.status(201).json(response);
    } else {
        res.status(500).json({ error: 'Error in adding note' });
    }
});

// DELETE /api/notes/:id 
router.delete('/notes/:id', (req, res) => {
    const id = req.params.id;
    const notes = getNotes();
    const deletedNote = notes.find((note) => note.id === id);

    if (deletedNote) {
        const filteredNotes = notes.filter((note) => note.id !== id);
        saveNotes(filteredNotes);
        res.status(200).json(filteredNotes);
    } else {
        res.status(500).json({ error: 'Error deleting note' });
    }
});

module.exports = router;
