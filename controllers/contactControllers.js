const nodemailer = require('nodemailer');
const Contact = require('../models/contact');
const Data = require('../models/data');
const msgs = require('../utilities/responseMessages');

const sendContactNotification = async (contact) => {
    const smtpUser = (process.env.SMTP_USER || '').trim();
    const smtpPass = (process.env.SMTP_PASS || '').trim();
    const smtpHost = (process.env.SMTP_HOST || '').trim();
    const smtpPort = Number(process.env.SMTP_PORT || 465);
    const smtpSecure = String(process.env.SMTP_SECURE || 'true').toLowerCase() === 'true';

    if (!smtpHost || !smtpUser || !smtpPass) {
        console.warn('Email notification skipped: SMTP_USER / SMTP_PASS not configured in .env');
        return;
    }

    const siteData = await Data.findOne();
    const recipient = (process.env.NOTIFY_EMAIL || siteData?.email || smtpUser).trim();

    const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpSecure,
        auth: {
            user: smtpUser,
            pass: smtpPass
        }
    });

    await transporter.sendMail({
        from: `"Portfolio Contact" <${smtpUser}>`,
        to: recipient,
        replyTo: contact.email,
        subject: `New Portfolio Message from ${contact.name}`,
        text: [
            `Name: ${contact.name}`,
            `Email: ${contact.email}`,
            `Phone: ${contact.phone}`,
            '',
            'Message:',
            contact.message
        ].join('\n'),
        html: `
            <h2>New Portfolio Contact Message</h2>
            <p><strong>Name:</strong> ${contact.name}</p>
            <p><strong>Email:</strong> ${contact.email}</p>
            <p><strong>Phone:</strong> ${contact.phone}</p>
            <hr />
            <p><strong>Message:</strong></p>
            <p style="white-space: pre-line;">${contact.message}</p>
        `
    });
};

const addContact = async (req, res) => {
    try {
        const created = await Contact.create(req.body);
        try {
            await sendContactNotification(created);
        } catch (mailError) {
            console.error('Contact saved, but email notification failed:', mailError.message);
        }

        res.status(201).json({
            msg: msgs.SUCESS,
            data: created
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: msgs.FAIL,
            error: error.message || 'Failed to send message'
        });
    }
};

const getContacts = async (req, res) => {
    try {
        const contacts = await Contact.find().sort({ _id: -1 });
        res.status(200).json({
            msg: msgs.SUCESS,
            data: contacts
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: msgs.FAIL,
            error: 'Failed to fetch messages'
        });
    }
};

const deleteContact = async (req, res) => {
    try {
        const deleted = await Contact.findByIdAndDelete(req.params.id);
        if (!deleted) {
            return res.status(404).json({
                msg: msgs.FAIL,
                error: 'Message not found'
            });
        }
        res.status(200).json({
            msg: msgs.SUCESS,
            data: deleted
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: msgs.FAIL,
            error: 'Failed to delete message'
        });
    }
};

module.exports = {
    addContact,
    getContacts,
    deleteContact
};
