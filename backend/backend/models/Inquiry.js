const mongoose = require('mongoose');

const InquirySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    email: {
        type: String,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    phone: {
        type: String
    },
    type: {
        type: String,
        enum: ['News', 'Movie', 'Advertising', 'WhatsApp', 'Other'],
        default: 'Other'
    },
    message: {
        type: String,
        required: [true, 'Please add a message or content details']
    },
    isRead: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Inquiry', InquirySchema);
