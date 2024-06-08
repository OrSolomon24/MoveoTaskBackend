const { getCodeBlocksCollection } = require('../data/database');

const getCodeBlocks = async (req, res) => {
    try {
        const codeBlocksCollection = getCodeBlocksCollection();
        const codeBlocks = await codeBlocksCollection.find().project({ id: 1, title: 1 }).toArray();
        res.json(codeBlocks);
    } catch (error) {
        console.error('Error retrieving code blocks:', error);
        res.status(500).send('Internal Server Error');
    }
};

const getCodeBlockById = async (req, res) => {
    try {
        const codeBlocksCollection = getCodeBlocksCollection();
        const codeBlock = await codeBlocksCollection.findOne({ id: parseInt(req.params.id) });
        if (codeBlock) {
            res.json(codeBlock);
        } else {
            res.status(404).send('Code block not found');
        }
    } catch (error) {
        console.error('Error retrieving code block:', error);
        res.status(500).send('Internal Server Error');
    }
};

module.exports = {
    getCodeBlocks,
    getCodeBlockById
};
