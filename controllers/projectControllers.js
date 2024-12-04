const Project = require(`./../models/project`);
const msgs = require(`./../utilities/responseMessages`);

const addProject = async (req, res) => {
    try {
        let newProject = req.body;
        let thumbPath = req.files[`thumb`][0].path;
        let imgsPath = req.files[`imgs`];
        let videoPath = req.files[`video`][0].path;
        let skills = JSON.parse(req.body.skills);
        let imgsPathes = [];
        imgsPath.forEach(img => {
            imgsPathes.push(img.path);
        });
        project = {...newProject, thumb: thumbPath, imgs: imgsPathes, video: videoPath, skills: skills};
        await Project.create(project);
        res.status(200).json({
            msg: msgs.SUCESS,
            data: project
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: msgs.FAIL,
            Data: error
        })
    }
}

const getProjects = async (req, res) => {
    try {
        let projects = await Project.find();
        res.status(200).json({
            msg: msgs.SUCESS,
            data: projects
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: msgs.FAIL,
            Data: error
        })
    }
}

module.exports = {
    addProject,
    getProjects
}