const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
    name: String,
    id: Number,
    password: String,
    confirmpassword: String,
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
});

userSchema.methods.generatingAuthToken = async function () {
    try {
        const token = await jwt.sign({ _id: this._id.toString() }, process.env.SECURE_KEY);
        this.tokens = this.tokens.concat({ token: token });
        await this.save();
        return token;
    } catch (e) {
        res.status(404).send(e);
    }
}

userSchema.pre("save", async function (next) {
    try {
        if (this.isModified("password")) {
            this.password = await bcrypt.hash(this.password, 10);
            this.confirmpassword = await bcrypt.hash(this.password, 10);
        }
        next();
    } catch (e) {
        res.status(400).send(e);
    }
})

const UserData = new mongoose.model("UserData", userSchema);

module.exports = UserData;