const express = require('express');
const router = express.Router();
const { getCodeBlocks, getCodeBlockById } = require('../controllers/codeBlockController');

router.get('/', getCodeBlocks);
router.get('/:id', getCodeBlockById);

module.exports = router;
