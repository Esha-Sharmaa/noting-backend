const mongoose = require('mongoose');

const labelSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    }
}, { timestamps: true });
module.exports = mongoose.model('Label', labelSchema);