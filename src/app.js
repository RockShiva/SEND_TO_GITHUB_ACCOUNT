require("dotenv").config();
const express = require("express");
const path = require("path");
const hbs = require("hbs");
const bcrypt = require("bcryptjs");
const cookieParser = require("cookie-parser");

const app = express();

const port = process.env.PORT || 8000;

require("./db/conn");
const UserData = require("./models/signup");
const auth = require("./middleware/auth");

const partials_path = path.join(__dirname, "../templates/partials")
const views_path = path.join(__dirname, "../templates/views")
const public_path = path.join(__dirname, "../public");

app.use(express.static(public_path));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.set("view engine", "hbs");
app.set("views", views_path)
hbs.registerPartials(partials_path);

app.get("/", (req, res) => {
    res.render("index");
});

app.get("/secret", auth, (req, res) => {
    console.log("secret page is initializing dude!!");
    // console.log(req.userDatas.name);
    res.render("secret", { name: req.userDatas.name });
});

app.get("/signout", auth, async (req, res) => {
    try {

        // req.userDatas.tokens = req.userDatas.tokens.filter((curElem) => {
        //     return curElem.token != req.token;
        // });

        req.userDatas.tokens = [];

        res.clearCookie();
        await req.userDatas.save();
        res.render("signin");
    } catch (e) {
        res.status(500).send(e);
    }
});

app.get("/signup", (req, res) => {
    res.render("signup");
});

app.get("/signin", (req, res) => {
    res.render("signin");
})


app.post("/signup", async (req, res) => {
    try {
        const password = req.body.password;
        const confirmpassword = req.body.confirmpassword;
        if (password === confirmpassword) {
            if (password == '' || confirmpassword == '') {
                res.send("plese Enter a unique password");
            } else {
                const userData = new UserData({
                    name: req.body.name,
                    id: req.body.id,
                    password: password,
                    confirmpassword: confirmpassword
                });

                const token = await userData.generatingAuthToken();

                res.cookie("jwt", token, {
                    expires: new Date(Date.now() + 60000),
                    httpOnly: true
                });

                const result = await userData.save();
                res.render("secret", { name: result.name });
            }
        } else {
            res.send("passwords are not matching");
        }
    } catch (e) {
        res.status(404).send(e);
    }
});

app.post("/signin", async (req, res) => {
    try {
        const id = req.body.id;
        const password = req.body.password;

        const user = await UserData.findOne({ id: id });

        const isMatch = await bcrypt.compare(password, user.password);

        const token = await user.generatingAuthToken();

        res.cookie("jwt", token, {
            expires: new Date(Date.now() + 600000),
            httpOnly: true
        });

        if (isMatch) {
            res.render("secret.hbs", { name: user.name });
        } else {
            res.send("id and password is not matching dude")
        }
    } catch (e) {
        res.status(404).send(e);
    }
})

app.listen(port, function () {
    console.log(`Running on port: ${port}`);
});