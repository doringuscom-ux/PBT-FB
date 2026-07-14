const axios = require('axios');
require('dotenv').config();
const EmailLog = require('../models/EmailLog');

// The "Unblockable" Google Apps Script Proxy URL
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzGCzXqAmSlZjX6jMUdKTN2Ow5pbswDiCvCH2Ctxju_LSoso2wMN0JJku2vFeDJeeWc/exec';

/**
 * PB Tadka - Generic Send via Google Proxy
 */
const sendViaProxy = async (to, subject, htmlContent) => {
    try {
        const response = await axios.post(GOOGLE_SCRIPT_URL, null, {
            params: {
                to: to,
                subject: subject,
                message: htmlContent
            }
        });

        if (response.data && response.data.success) {
            return { success: true };
        }
        return { success: false, error: response.data?.error || 'Unknown proxy error' };
    } catch (err) {
        return { success: false, error: err.message };
    }
};

/**
 * PB Tadka - Send OTP Email
 */
const sendOtpEmail = async (to, otp) => {
    const subject = 'Verification Code for PB Tadka';
    const htmlContent = `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 500px; margin: auto;">
            <h2 style="color: #e11d48; text-align: center;">PB Tadka Verification</h2>
            <p>Hello,</p>
            <p>Thank you for choosing PB Tadka. Please use the following One-Time Password (OTP) to proceed:</p>
            <div style="background: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #333; margin: 20px 0; border-radius: 8px;">
                ${otp}
            </div>
            <p>This code will expire in 10 minutes.</p>
            <p>If you didn't request this, please ignore this email.</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 10px; color: #aaa; text-align: center;">&copy; 2026 PB Tadka. All rights reserved.</p>
        </div>
    `;

    const result = await sendViaProxy(to, subject, htmlContent);
    if (result.success) {
        console.log(`[Email Service] OTP sent successfully to ${to}`);
        return true;
    } else {
        console.error(`[Email Service] OTP failed for ${to}:`, result.error);
        return false;
    }
};

/**
 * PB Tadka - Send Notification to Subscribers
 */
const sendPostNotification = async (post, subscribers) => {
    if (!subscribers || subscribers.length === 0) return;

    const postType = post.category ? 'News' : (post.trailerUrl ? 'Movie' : 'Video');
    const postLink = `${process.env.FRONTEND_URL || 'https://pbtadka.com'}/${postType.toLowerCase()}/${post.slug || post._id}`;
    const subject = `New ${postType}: ${post.title}`;

    for (const sub of subscribers) {
        const htmlContent = `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f172a; color: #ffffff; padding: 40px 20px; border-radius: 15px; max-width: 600px; margin: auto;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #e11d48; margin: 0; font-size: 28px; text-transform: uppercase; letter-spacing: 2px;">PB TADKA</h1>
                </div>
                <div style="background: #1e293b; border-radius: 12px; overflow: hidden; border: 1px solid #334155;">
                    ${post.image ? `<img src="${post.image}" alt="${post.title}" style="width: 100%; height: auto; display: block;">` : ''}
                    <div style="padding: 25px;">
                        <h2 style="margin: 15px 0; font-size: 22px; line-height: 1.4;">${post.title}</h2>
                        <a href="${postLink}" style="display: inline-block; background: #e11d48; color: white; padding: 12px 25px; border-radius: 8px; text-decoration: none; font-weight: bold;">
                            READ FULL STORY
                        </a>
                    </div>
                </div>
            </div>
        `;

        const result = await sendViaProxy(sub.email, subject, htmlContent);
        
        await EmailLog.create({
            postTitle: post.title,
            postType: postType,
            recipientEmail: sub.email,
            status: result.success ? 'success' : 'failed',
            error: result.success ? null : result.error
        });

        if (result.success) {
            console.log(`[Email Service] Notified ${sub.email}`);
        } else {
            console.error(`[Email Service] Failed for ${sub.email}:`, result.error);
        }
    }
    return true;
};

/**
 * PB Tadka - Send Admin Notification (For New Inquiries/Content)
 */
const sendAdminNotification = async (type, data) => {
    const adminEmail = 'shivsarsa@gmail.com';
    const subject = `Alert: New ${type} on PB Tadka`;
    
    // Create a nice table for the data
    let dataRows = '';
    for (const [key, value] of Object.entries(data)) {
        dataRows += `
            <tr>
                <td style="padding: 10px; border: 1px solid #eee; font-weight: bold; text-transform: capitalize;">${key}</td>
                <td style="padding: 10px; border: 1px solid #eee;">${value}</td>
            </tr>
        `;
    }

    const htmlContent = `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 600px; margin: auto;">
            <h2 style="color: #e11d48; text-align: center;">New ${type} Received</h2>
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                ${dataRows}
            </table>
            <p style="font-size: 12px; color: #666; text-align: center;">You can manage this from your Admin Dashboard.</p>
        </div>
    `;

    const result = await sendViaProxy(adminEmail, subject, htmlContent);
    if (result.success) {
        console.log(`[Email Service] Admin notified of new ${type}`);
        return true;
    } else {
        console.error(`[Email Service] Admin notification failed:`, result.error);
        return false;
    }
};

module.exports = { sendOtpEmail, sendPostNotification, sendAdminNotification };
