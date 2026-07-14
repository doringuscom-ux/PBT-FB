const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// GET all users
router.get('/', async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// CREATE a sub-admin
router.post('/', async (req, res) => {
    const { username, password, role, email, fullName, employeeId } = req.body;
    
    // Check if sub-admin is being created and employeeId is missing
    const targetRole = role || 'sub-admin';
    if (targetRole === 'sub-admin' && !employeeId) {
        return res.status(400).json({ success: false, message: 'Employee ID is compulsory for Sub-Admins' });
    }

    try {
        const newUser = new User({ 
            username, 
            password, 
            email,
            fullName,
            employeeId,
            role: targetRole
        });
        await newUser.save();
        res.status(201).json({ success: true, message: 'User created' });
    } catch (err) {
        console.error("User Creation Error:", err.message);
        res.status(400).json({ success: false, message: err.message });
    }
});

// DELETE a user
router.delete('/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ success: true, message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// BLOCK/UNBLOCK user
router.put('/:id/block', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        user.isBlocked = !user.isBlocked;
        await user.save();
        res.json({ success: true, isBlocked: user.isBlocked });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// UPDATE A USER
router.put('/:id', async (req, res) => {
    const { username, email, fullName, phone, role, employeeId } = req.body;
    
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // If promoting to sub-admin or updating sub-admin, employeeId is mandatory
        if (role === 'sub-admin' && !employeeId && !user.employeeId) {
            return res.status(400).json({ success: false, message: 'Employee ID is compulsory for Sub-Admins' });
        }

        if (username) user.username = username;
        if (email) user.email = email;
        if (fullName) user.fullName = fullName;
        if (phone !== undefined) user.phone = phone;
        if (role) user.role = role;
        if (employeeId) user.employeeId = employeeId;

        await user.save();
        res.json({ success: true, message: 'User updated successfully', user });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// CHANGE USER PASSWORD (Admin)
router.put('/:id/password', async (req, res) => {
    const { newPassword } = req.body;
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        
        user.password = newPassword;
        await user.save();
        res.json({ success: true, message: 'Password updated successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
