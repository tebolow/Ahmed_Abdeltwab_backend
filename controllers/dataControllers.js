const Data = require("../models/data");
const msgs = require(`./../utilities/responseMessages`)

const getData = async (req, res) => {
    try {
        const data = await Data.findOne();
        if (!data) {
            throw(`No data found`);
        }
        res.status(200).json({
            msg: msgs.SUCESS,
            data: data
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: msgs.FAIL,
            Data: error
        })
    }
}

const editData = async (req, res) => {
    try {
        newData = req.body
        let logoPath = req.files[`logo`][0].path;
        let homeImagePath = req.files[`homeImage`][0].path;
        let aboutImagePath = req.files[`aboutImage`][0].path;
        let data = {...newData, logo: logoPath, homeImage: homeImagePath, aboutImage: aboutImagePath}
        let myData = await Data.find();
        if (myData.length === 0) {
            await Data.create(data);
        }
        await Data.findOneAndUpdate({}, data);
        res.status(200).json({
            msg: msgs.SUCESS,
            data: data
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
    getData,
    editData
}