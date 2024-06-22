const mongoose = require('mongoose');

const collaboratorSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    noteId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Note",
        required: true
    },
    permission: {
        type: String,
        enum: ['read', 'write'],
        default: 'read'
    }

}, { timestamps: true });

module.exports = mongoose.model('Collaborator', collaboratorSchema);
