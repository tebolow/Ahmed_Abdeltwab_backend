const Project = require('../models/project');
const msgs = require('../utilities/responseMessages');
const { persistUploadedFile, removeUploadedFile } = require('../utilities/fileHelpers');

const parseSkills = (rawSkills) => {
    if (!rawSkills) return [];
    if (Array.isArray(rawSkills)) return rawSkills;
    try {
        const parsed = JSON.parse(rawSkills);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return String(rawSkills)
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);
    }
};

const addProject = async (req, res) => {
    try {
        const files = req.files || {};
        if (!files.thumb?.[0]) {
            return res.status(400).json({
                msg: msgs.FAIL,
                error: 'Thumbnail image is required'
            });
        }

        const thumbPath = await persistUploadedFile(files.thumb[0], 'portfolio/projects');
        const imgsPaths = await Promise.all(
            (files.imgs || []).map((img) => persistUploadedFile(img, 'portfolio/projects'))
        );
        const videoPath = files.video?.[0]
            ? await persistUploadedFile(files.video[0], 'portfolio/projects')
            : '';
        const skills = parseSkills(req.body.skills);

        const project = await Project.create({
            name: req.body.name,
            brief: req.body.brief,
            description: req.body.description,
            category: req.body.category,
            thumb: thumbPath,
            imgs: imgsPaths,
            video: videoPath,
            skills
        });

        res.status(201).json({
            msg: msgs.SUCESS,
            data: project
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: msgs.FAIL,
            error: error.message || 'Failed to create project'
        });
    }
};

const getProjects = async (req, res) => {
    try {
        const projects = await Project.find().sort({ createdAt: -1 });
        res.status(200).json({
            msg: msgs.SUCESS,
            data: projects
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: msgs.FAIL,
            error: 'Failed to fetch projects'
        });
    }
};

const getProjectById = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({
                msg: msgs.FAIL,
                error: 'Project not found'
            });
        }
        res.status(200).json({
            msg: msgs.SUCESS,
            data: project
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: msgs.FAIL,
            error: 'Failed to fetch project'
        });
    }
};

const updateProject = async (req, res) => {
    try {
        const existing = await Project.findById(req.params.id);
        if (!existing) {
            return res.status(404).json({
                msg: msgs.FAIL,
                error: 'Project not found'
            });
        }

        const files = req.files || {};
        let thumbPath = existing.thumb;
        if (files.thumb?.[0]) {
            removeUploadedFile(existing.thumb);
            thumbPath = await persistUploadedFile(files.thumb[0], 'portfolio/projects');
        }

        let imgsPaths = existing.imgs;
        if (files.imgs?.length) {
            (existing.imgs || []).forEach(removeUploadedFile);
            imgsPaths = await Promise.all(
                files.imgs.map((img) => persistUploadedFile(img, 'portfolio/projects'))
            );
        }

        let videoPath = existing.video;
        if (req.body.removeVideo === 'true') {
            removeUploadedFile(existing.video);
            videoPath = '';
        } else if (files.video?.[0]) {
            removeUploadedFile(existing.video);
            videoPath = await persistUploadedFile(files.video[0], 'portfolio/projects');
        }

        const skills = req.body.skills !== undefined ? parseSkills(req.body.skills) : existing.skills;

        const updated = await Project.findByIdAndUpdate(
            existing._id,
            {
                name: req.body.name ?? existing.name,
                brief: req.body.brief ?? existing.brief,
                description: req.body.description ?? existing.description,
                category: req.body.category ?? existing.category,
                thumb: thumbPath,
                imgs: imgsPaths,
                video: videoPath,
                skills
            },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            msg: msgs.SUCESS,
            data: updated
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: msgs.FAIL,
            error: error.message || 'Failed to update project'
        });
    }
};

const deleteProject = async (req, res) => {
    try {
        const project = await Project.findByIdAndDelete(req.params.id);
        if (!project) {
            return res.status(404).json({
                msg: msgs.FAIL,
                error: 'Project not found'
            });
        }

        removeUploadedFile(project.thumb);
        (project.imgs || []).forEach(removeUploadedFile);
        removeUploadedFile(project.video);

        res.status(200).json({
            msg: msgs.SUCESS,
            data: project
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: msgs.FAIL,
            error: 'Failed to delete project'
        });
    }
};

module.exports = {
    addProject,
    getProjects,
    getProjectById,
    updateProject,
    deleteProject
};
