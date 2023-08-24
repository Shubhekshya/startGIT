const express = require('express');
const connection = require('../connection');
const router = express.Router();
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

require('dotenv').config();
var auth = require('../services/authentication');
var checkRole = require('../services/checkRole');

router.post('/signup', (req, res) => {
    let user = req.body;
    query = "select email,passwords,roles,stat from user where email=?"
    connection.query(query, [user.email], (err, results) => {
        if (!err) {
            if (results.length <= 0) {
                query = "insert into user(FULLName,contactNumber,email,passwords,stat,roles) values(?,?,?,?,'false','user')";
                connection.query(query, [user.FULLName, user.contactNumber, user.email, user.passwords], (err, results) => {
                    if (!err) {
                        return res.status(200).json({ message: "Successfully Registered" });
                    }
                    else {
                        return res.status(500).json(err);
                    }
                })
            }
            else {
                return res.status(400).json({ message: "Email Already exists." });
            }
        }
        else {
            return res.status(500).json(err);
        }
    })
})

router.post('/login', (req, res) => {
    const user = req.body;
    query = "select email,passwords,roles,stat from user where email=?";
    connection.query(query, [user.email], (err, results) => {
        if (!err) {
            if (results.length <= 0 || results[0].passwords != user.passwords) {
                return res.status(401).json({ message: "Incorrect Username or password." });
            }
            else if (results[0].stat == 'false') {
                return res.status(401).json({ messgae: "Wait for admin aproval." });
            }
            else if (results[0].passwords == user.passwords) {
                const response = { email: results[0].email, role: results[0].role }
                const accessToken = jwt.sign(response, process.env.ACCESS_TOKEN, { expiresIn: '8h' })
                res.status(200).json({ token: accessToken });
            }
            else {
                return res.status(400).json({ message: "Something went wrong." });
            }

        }
        else { return res.status(500).json(err); }
    })
})

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    }
})

router.post('/forgotpassword', (req, res) => {
    const user = req.body;
    query = "select email,passwords from user where email=? ";
    connection.query(query, [user.email], (err, results) => {
        if (!err) {
            if (results.length <= 0) {
                return res.status(200).json({ message: "Password sent successfully to your registered email" });
            }
            else {
                var mailOption = {
                    from: process.env.EMAIL,
                    to: results[0].email,
                    subject: 'password by restaurant',
                    html: '<p><b>Your login details for the restaurant</b<br><b>Email:</b>' + results[0].email + '<br><b>Password: </b>' + results[0].password + '<br><a href="http://localhost:4200/">Click here to login</a></p>'

                };
                transporter.sendMail(mailOption, function (error, info) {
                    if (error) {
                        console.log(error);
                    }
                    else {
                        console.log('Email sent: ' + info.response);
                    }
                });
                return res.status(200).json({ message: "Password sent successfully to your registered email" });
            }
        }
        else {
            return res.status(500).json(err);
        }
    })
})


router.get('/get', auth.authenticateToken, checkRole.checkRole, (req, res) => {
    var query = "select id,FULLName,contactNumber,stat from user where roles='user' ";
    connection.query(query, (err, results) => {
        if (!err) { return res.status(200).json(results); }
        else {
            return res.status(500).json(err);
        }
    })
})

router.patch('/update', auth.authenticateToken, checkRole.checkRole, (req, res) => {
    let user = req.body;
    var query = "update user set stat=? where id=?";
    connection.query(query, [user.stat, user.id], (err, results) => {
        if (!err) {
            if (results.affectedRows == 0) {
                return res.status(404).json({ message: "User id does not exist" });
            }
            return res.status(200).json({ message: "USER upated successfully" });

        }
        else {
            return res.status(500).json(err);
        }
    })
})

router.get('/checkToken', auth.authenticateToken, (req, res) => {
    return res.status(200).json({ message: 'true' })
})

router.post('/changePassword', (req, res) => {
    const user = req.body;
    const email = res.locals.email;
    var query = "select *from user where email=? and passwords=?";
    connection.query(query, [email, user.oldpasswords], (err, results) => {
        if (!err) {
            if (results.length <= 0) {
                return res.status(400).json({ message: "Incorrect old password" });
            }
            else if (results[0].passwords == user.oldpasswords) {
                query = "update user set password where email=?";
                connection.query(query, [user.newpasswords, email], (err, results) => {
                    if (!err) {
                        return res.status(200).json({ messgae: "password updated successfully." })
                    }
                    else {
                        return res.status(500).json(err);
                    }
                })
            }
            else {
                return res.status(400).json({ message: "Something went wrong." });
            }
        }
        else {
            return res.status(500).json(err);
        }
    })

})

module.exports = router;