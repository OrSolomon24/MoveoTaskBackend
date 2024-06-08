const { MongoClient } = require('mongodb');
require('dotenv').config();

let codeBlocksCollection;
let mentorStudentCollection;

const connectToDatabase = async () => {
    const client = new MongoClient(process.env.MONGODB_URI);
    try {
        await client.connect();
        console.log('Connected to MongoDB');
        const db = client.db('MoveoTask');
        codeBlocksCollection = db.collection('codeBlocks');
        mentorStudentCollection = db.collection('mentorStudent');
        console.log('Collections initialized');
    } catch (err) {
        console.error('Failed to connect to MongoDB', err);
        await client.close(); // Ensure the client is closed on error
        process.exit(1);
    }
};

const getCodeBlocksCollection = () => codeBlocksCollection;
const getMentorStudentCollection = () => mentorStudentCollection;

module.exports = {
    connectToDatabase,
    getCodeBlocksCollection,
    getMentorStudentCollection
};
