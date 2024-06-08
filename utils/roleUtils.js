const getRoleForUser = async (codeBlockId, ip, mentorStudentCollection) => {
    try {
        let role = 'mentor';
        const existingRecord = await mentorStudentCollection.findOne({ blockId: codeBlockId });

        if (existingRecord) {
            role = 'student';
        }

        const existingStudent = await mentorStudentCollection.findOne({
            blockId: codeBlockId,
            ip: ip,
            role: 'student'
        });

        return { role, existingStudent };
    } catch (error) {
        console.error('Error in getRoleForUser:', error);
        throw new Error('Failed to get role for user');
    }
};

const insertMentorStudentRecord = async (codeBlockId, ip, role, mentorStudentCollection) => {
    try {
        await mentorStudentCollection.insertOne({
            blockId: codeBlockId,
            ip: ip,
            role: role
        });
    } catch (error) {
        console.error('Error in insertMentorStudentRecord:', error);
        throw new Error('Failed to insert mentor-student record');
    }
};

module.exports = {
    getRoleForUser,
    insertMentorStudentRecord
};
