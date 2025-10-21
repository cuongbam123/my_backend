const express = require('express');
const router = express.Router();
const noteController = require('../controllers/NoteController');
const { verifyToken } = require('../middlewares/auth');

router.get('/', verifyToken, noteController.getAllNotes);
router.post('/', verifyToken, noteController.createNote);

module.exports = router;
