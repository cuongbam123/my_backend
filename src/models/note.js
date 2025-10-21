const { Schema, model } = require('mongoose');

const noteSchema = new Schema({
  fullname: { type: String, required: true },
  phone: { type: String, required: true },
  content: String
}, { collection: 'note' });

module.exports = model('Note', noteSchema);
