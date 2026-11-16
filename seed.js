const crypto = require('crypto');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

const Admin = require('./models/authorization');
const Data = require('./models/data');
const Social = require('./models/social');

const hashPassword = (password) => {
    const salt = crypto.randomBytes(16).toString('hex');
    const derived = crypto.scryptSync(password, salt, 64).toString('hex');
    return `${salt}:${derived}`;
};

const defaultData = {
    name: "Hi, I'm Ahmed Abdeltwab 👋",
    description:
        "Full-Stack Web Developer crafting fast, accessible, and scalable web applications with Angular, Node.js, Express, and MongoDB. I bridge clean UI architecture with reliable backend APIs and CMS-driven workflows.",
    email: "aabdeltwab62@gmail.com",
    phone: "+201090573140",
    logo: "uploads/seed-logo.png",
    location: "Cairo, Egypt",
    availability: "Available for new projects",
    about:
        "I am Ahmed Abdeltwab, a Full-Stack Web Developer passionate about building end-to-end digital products—from responsive, accessible frontend interfaces in Angular and TypeScript to secure REST APIs and database architectures in Node.js, Express, and MongoDB.\n\nI care deeply about clean code, maintainable architecture, performance, and seamless user experiences across every screen size.\n\nWhether you need a custom web application, an interactive portfolio or CMS, or API integrations, feel free to explore my work and reach out!",
    homeImage: "uploads/seed-home.jpeg",
    aboutImage: "uploads/seed-about.JPG",
    toolkit: ['Angular', 'TypeScript', 'HTML5', 'CSS3', 'Node.js', 'Express.js', 'MongoDB', 'REST APIs', 'Git'],
    portfolioFilters: ['All', 'Web', 'Mobile', 'Desktop', 'AI']
};

const defaultSocials = [
    {
        name: "GitHub",
        link: "https://github.com/tebolow",
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>`
    },
    {
        name: "LinkedIn",
        link: "https://www.linkedin.com/in/ahmed-abdeltwab-a57916225/",
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>`
    },
    {
        name: "Instagram",
        link: "https://www.instagram.com/ahmed_._abdeltwab/",
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>`
    },
    {
        name: "Facebook",
        link: "https://www.facebook.com/profile.php?id=100003515136721",
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>`
    },
    {
        name: "WhatsApp",
        link: "https://wa.me/201090573140",
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>`
    },
    {
        name: "Email",
        link: "mailto:aabdeltwab62@gmail.com",
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>`
    }
];

async function runSeed() {
    await mongoose.connect(process.env.DB);

    const adminKey = (process.env.ADMIN_KEY || '').trim();
    const adminPassword = process.env.ADMIN_PASSWORD || '';
    if (adminKey && adminPassword) {
        await Admin.findOneAndUpdate(
            { key: adminKey },
            { key: adminKey, password: hashPassword(adminPassword) },
            { upsert: true, new: true }
        );
        console.log(`Synced admin credentials for "${adminKey}"`);
    }

    if ((await Data.countDocuments()) === 0) {
        await Data.create(defaultData);
        console.log('Seeded initial Data document');
    }

    if ((await Social.countDocuments()) === 0) {
        await Social.insertMany(defaultSocials);
        console.log(`Seeded ${defaultSocials.length} social links`);
    }

    process.exit(0);
}

runSeed().catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
});

