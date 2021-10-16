const jwt = require("jsonwebtoken");
const UserData = require("../models/signup");

const auth = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;
        const verifyUser = jwt.verify(token, process.env.SECURE_KEY);

        const userDatas = await UserData.findOne({ _id: verifyUser._id });

        req.userDatas = userDatas;
        req.token = token

        next();
    } catch (e) {
        res.status(500).send(e);
    }
};

module.exports = auth;