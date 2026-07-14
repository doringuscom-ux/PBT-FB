const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    phone: { type: String },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'sub-admin', 'user'], default: 'user' },
    isVerified: { type: Boolean, default: true },
    isBlocked: { type: Boolean, default: false },
    employeeId: { type: String },
    otp: { type: String },
    otpExpires: { type: Date },
    createdAt: { type: Date, default: Date.now }
});

// Hash password before saving
UserSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
UserSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
