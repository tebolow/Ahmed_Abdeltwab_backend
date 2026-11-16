const path = require('path');
const fs = require('fs');
const Data = require('../models/data');
const msgs = require('../utilities/responseMessages');
const { normalizePath, persistUploadedFile, removeUploadedFile } = require('../utilities/fileHelpers');

const getData = async (req, res) => {
    try {
        const data = await Data.findOne();
        res.status(200).json({
            msg: msgs.SUCESS,
            data: data || null
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: msgs.FAIL,
            error: 'Failed to fetch data'
        });
    }
};

const editData = async (req, res) => {
    try {
        const existing = await Data.findOne();
        const files = req.files || {};

        const logoPath = files.logo?.[0]
            ? await persistUploadedFile(files.logo[0], 'portfolio/site')
            : (existing?.logo || '');
        const homeImagePath = files.homeImage?.[0]
            ? await persistUploadedFile(files.homeImage[0], 'portfolio/site')
            : (existing?.homeImage || '');
        const aboutImagePath = files.aboutImage?.[0]
            ? await persistUploadedFile(files.aboutImage[0], 'portfolio/site')
            : (existing?.aboutImage || '');
        const cvPath = files.cv?.[0]
            ? await persistUploadedFile(files.cv[0], 'portfolio/cv')
            : (existing?.cv || '');

        if (files.logo?.[0] && existing?.logo) removeUploadedFile(existing.logo);
        if (files.homeImage?.[0] && existing?.homeImage) removeUploadedFile(existing.homeImage);
        if (files.aboutImage?.[0] && existing?.aboutImage) removeUploadedFile(existing.aboutImage);
        if (files.cv?.[0] && existing?.cv) removeUploadedFile(existing.cv);

        const parseStringArray = (rawVal) => {
            if (Array.isArray(rawVal)) return rawVal.map((s) => String(s).trim()).filter(Boolean);
            try {
                const parsed = JSON.parse(rawVal);
                return Array.isArray(parsed) ? parsed.map((s) => String(s).trim()).filter(Boolean) : [];
            } catch {
                return String(rawVal)
                    .split(',')
                    .map((s) => s.trim())
                    .filter(Boolean);
            }
        };

        let toolkit = existing?.toolkit;
        if (req.body.toolkit !== undefined) {
            toolkit = parseStringArray(req.body.toolkit);
        }

        let portfolioFilters = existing?.portfolioFilters;
        if (req.body.portfolioFilters !== undefined) {
            portfolioFilters = parseStringArray(req.body.portfolioFilters);
        }

        const payload = {
            ...req.body,
            logo: logoPath,
            homeImage: homeImagePath,
            aboutImage: aboutImagePath,
            cv: cvPath,
            ...(toolkit !== undefined ? { toolkit } : {}),
            ...(portfolioFilters !== undefined ? { portfolioFilters } : {})
        };

        let saved;
        if (!existing) {
            saved = await Data.create(payload);
        } else {
            saved = await Data.findByIdAndUpdate(existing._id, payload, { new: true, runValidators: true });
        }

        res.status(200).json({
            msg: msgs.SUCESS,
            data: saved
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: msgs.FAIL,
            error: error.message || 'Failed to update data'
        });
    }
};

const downloadCv = async (req, res) => {
    try {
        const data = await Data.findOne();
        if (!data || !data.cv) {
            return res.status(404).json({
                msg: msgs.FAIL,
                error: 'CV file has not been uploaded yet'
            });
        }

        const safeOwner = (data.name || 'Portfolio').replace(/[^a-zA-Z0-9_-]+/g, '_');

        if (/^https?:\/\//i.test(data.cv)) {
            const response = await fetch(data.cv);
            if (!response.ok) {
                return res.status(404).json({ msg: msgs.FAIL, error: 'CV file not found' });
            }
            const buffer = Buffer.from(await response.arrayBuffer());
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="${safeOwner}_CV.pdf"`);
            return res.send(buffer);
        }

        const fullPath = path.resolve(process.cwd(), normalizePath(data.cv));
        if (!fs.existsSync(fullPath)) {
            return res.status(404).json({
                msg: msgs.FAIL,
                error: 'CV file not found on server'
            });
        }

        const ext = path.extname(fullPath) || '.pdf';
        res.download(fullPath, `${safeOwner}_CV${ext}`);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: msgs.FAIL,
            error: 'Failed to download CV'
        });
    }
};

const updateFilters = async (req, res) => {
    try {
        const filters = Array.isArray(req.body.portfolioFilters)
            ? req.body.portfolioFilters.map((s) => String(s).trim()).filter(Boolean)
            : [];
        const existing = await Data.findOne();
        if (!existing) {
            return res.status(404).json({
                msg: msgs.FAIL,
                error: 'Site data not initialized yet'
            });
        }
        const updated = await Data.findByIdAndUpdate(
            existing._id,
            { portfolioFilters: filters },
            { new: true }
        );
        res.status(200).json({
            msg: msgs.SUCESS,
            data: updated
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: msgs.FAIL,
            error: 'Failed to update portfolio filters'
        });
    }
};

module.exports = {
    getData,
    editData,
    downloadCv,
    updateFilters
};
