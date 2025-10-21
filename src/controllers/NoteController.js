const noteService = require('../services/NoteService');

/**
 * Lấy danh sách ghi chú (người dùng)
 */
exports.getAllNotes = async (req, res) => {
  try {
    const notes = await noteService.getAllNotes();
    res.json({ success: true, data: notes });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi lấy ghi chú' });
  }
};

/**
 * Tạo ghi chú mới (người dùng)
 */ 
exports.createNote = async (req, res) => {
  try {
    const note = await noteService.createNote(req.body);
    res.status(201).json({ success: true, data: note });
  } catch (err) {
    console.error("Lỗi tạo ghi chú:", err);
    res.status(500).json({ success: false, message: "Lỗi tạo ghi chú", error: err.message });
  }
};

