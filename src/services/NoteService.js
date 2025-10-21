
const Note = require('../models/note');

async function getAllNotes() {
  return await Note.find();
}

async function createNote(data) {
  const note = new Note(data);
  return await note.save();
}

module.exports = { getAllNotes, createNote };

