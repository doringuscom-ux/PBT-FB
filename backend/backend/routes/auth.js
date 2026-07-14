const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Get current user session
router.get('/me', (req, res) => {
    if (req.session.user) {
        res.json({ success: true, user: req.session.user });
    } else {
        res.status(401).json({ success: false, message: 'Not authenticated' });
    }
});

// Logout
router.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) return res.status(500).json({ success: false, message: 'Logout failed' });
        res.clearCookie('connect.sid'); // Default session cookie name
        res.json({ success: true, message: 'Logged out successfully' });
    });
});

// Register User
router.post('/register', async (req, res) => {
    const { username, email, fullName, phone, password } = req.body;
    
    // Password Validation
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{8,})/;
    if (!passwordRegex.test(password)) {
        return res.status(400).json({ 
            success: false, 
            message: 'Password must be at least 8 characters long, contain one uppercase letter and one special character.' 
        });
    }

    try {
        let userExists = await User.findOne({ $or: [{ username }, { email }] });
        if (userExists) return res.status(400).json({ success: false, message: 'Username or Email already exists' });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const user = new User({ 
            username, 
            email, 
            fullName, 
            phone, 
            password, 
            role: 'user',
            isVerified: true
        });
        await user.save();

        const userData = { id: user._id, username: user.username, role: user.role };
        req.session.user = userData;

        res.status(201).json({ 
            success: true, 
            message: 'Registration successful! Welcome to Pbtadka.',
            user: userData
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Verify Registration OTP (Keep for legacy but redundant for new users)
router.post('/verify-registration', async (req, res) => {
    const { email, otp } = req.body;
    try {
        const user = await User.findOne({ 
            email, 
            otp, 
            otpExpires: { $gt: Date.now() } 
        });

        if (!user) return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });

        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        const userData = { id: user._id, username: user.username, role: user.role };
        req.session.user = userData;

        res.json({ success: true, message: 'Email verified successfully!', user: userData });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Forgot Password - Generate OTP
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.otp = otp;
        user.otpExpires = Date.now() + 600000; // 10 mins
        await user.save();

        // Send OTP Email
        const { sendOtpEmail } = require('../utils/emailService');
        await sendOtpEmail(email, otp);
        
        res.json({ success: true, message: 'OTP sent to your email' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
    const { email, otp, newPassword } = req.body;
    try {
        const user = await User.findOne({ 
            email, 
            otp, 
            otpExpires: { $gt: Date.now() } 
        });

        if (!user) return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });

        // Password Validation for new password
        const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{8,})/;
        if (!passwordRegex.test(newPassword)) {
            return res.status(400).json({ 
                success: false, 
                message: 'New password must be at least 8 characters long, contain one uppercase letter and one special character.' 
            });
        }

        user.password = newPassword;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        res.json({ success: true, message: 'Password reset successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Login User
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ 
            $or: [
                { username: username }, 
                { email: username }
            ] 
        });
        if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });

        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' });

        if (user.isBlocked) {
            return res.status(403).json({ success: false, message: 'Your account has been blocked. Please contact support.' });
        }


        const userData = { id: user._id, username: user.username, role: user.role };
        req.session.user = userData;

        res.json({ 
            success: true, 
            message: 'Login successful',
            user: userData
        });
    } catch (err) {
        console.error('Login Error:', err.message);
        res.status(500).json({ success: false, message: 'Server error: ' + err.message });
    }
});

module.exports = router;
