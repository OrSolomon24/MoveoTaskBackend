const { getCodeBlocksCollection, getMentorStudentCollection } = require('../data/database');
const { getRoleForUser, insertMentorStudentRecord } = require('../utils/roleUtils');
const { UserRole } = require('../constants/constants');
let connections = {};

const handleSocketConnection = (socket) => {
    console.log('New client connected');

    socket.on('joinCodeBlock', async ({ codeBlockId }) => {
        try {
            console.log(`Client joining code block: ${codeBlockId}`);
            const codeBlocksCollection = getCodeBlocksCollection();
            const mentorStudentCollection = getMentorStudentCollection();

            const { role, existingStudent } = await getRoleForUser(codeBlockId, socket.handshake.address, mentorStudentCollection);

            if (role === UserRole.STUDENT && existingStudent) {
                console.log('Student already exists in the collection');
            } else {
                await insertMentorStudentRecord(codeBlockId, socket.handshake.address, role, mentorStudentCollection);
                console.log('New document inserted into mentorStudent collection');
            }

            if (!connections[codeBlockId]) {
                connections[codeBlockId] = { mentor: null, student: null };
            }

            if (role === UserRole.MENTOR) {
                connections[codeBlockId].mentor = socket;
            } else if (role === UserRole.STUDENT) {
                connections[codeBlockId].student = socket;
            }

            socket.join(codeBlockId);

            if (role === UserRole.STUDENT && connections[codeBlockId].mentor) {
                const codeBlock = await codeBlocksCollection.findOne({ id: parseInt(codeBlockId) });
                socket.emit('codeUpdate', codeBlock.code);
            }

            socket.emit('roleAssigned', role);
        } catch (error) {
            console.error('Error in joinCodeBlock event:', error);
            socket.emit('error', 'An error occurred while joining the code block');
        }
    });

    socket.on('codeChange', async ({ codeBlockId, newCode }) => {
        try {
            const codeBlocksCollection = getCodeBlocksCollection();
            const codeBlock = await codeBlocksCollection.findOne({ id: parseInt(codeBlockId) });

            if (connections[codeBlockId].mentor) {
                connections[codeBlockId].mentor.emit('codeUpdate', newCode);
            }

            if (newCode === codeBlock.solution) {
                socket.emit('solutionMatched');
            }
        } catch (error) {
            console.error('Error in codeChange event:', error);
            socket.emit('error', 'An error occurred while changing the code');
        }
    });

    socket.on('leaveCodeBlock', async ({ codeBlockId, role }) => {
        console.log(`Client leaving code block: ${codeBlockId} ${role}`);
        try {
            const mentorStudentCollection = getMentorStudentCollection();

            if (!mentorStudentCollection) {
                console.error('Mentor student collection is not initialized');
                socket.emit('error', 'Mentor student collection is not initialized');
                return;
            }
            const roleDocument = {blockId: codeBlockId,
                role,
                ip: socket.handshake.address};

            const matchingDocuments = await mentorStudentCollection.find(roleDocument).toArray();
            console.log('Matching documents:', matchingDocuments);

            const deletionResult = await mentorStudentCollection.deleteOne(roleDocument);

            if (deletionResult.deletedCount === 1) {
                console.log(`Client leaving code block: ${codeBlockId} ${role} ${socket.handshake.address}`);
            } else {
                console.error(`Failed to delete document for client leaving code block: ${codeBlockId} ${role} ${socket.handshake.address}`);
                console.log('Deletion result:', deletionResult);
            }
        } catch (error) {
            console.error('Error in leaveCodeBlock event:', error);
            socket.emit('error', 'An error occurred while leaving the code block');
        }
    });

    socket.on('disconnect', async () => {
        try {
            console.log('Client disconnected');
            const mentorStudentCollection = getMentorStudentCollection();

            for (const codeBlockId in connections) {
                if (connections[codeBlockId].mentor === socket) {
                    connections[codeBlockId].mentor = null;
                    await mentorStudentCollection.deleteOne({ blockId: codeBlockId, role: UserRole.MENTOR, ip: socket.handshake.address });
                } else if (connections[codeBlockId].student === socket) {
                    connections[codeBlockId].student = null;
                    await mentorStudentCollection.deleteOne({ blockId: codeBlockId, role: 'student', ip: socket.handshake.address });
                }
            }
        } catch (error) {
            console.error('Error in disconnect event:', error);
        }
    });
};

module.exports = { handleSocketConnection };
