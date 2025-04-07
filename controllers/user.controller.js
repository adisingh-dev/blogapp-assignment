import path from 'node:path';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import axios from 'axios';
import {pool} from  '../db/config.js';

class UserController {
    static async auth(req, res, next) {
        if(!req.cookies.bearer_token) {
            return (req.url=='/login' || req.url=='/register')?
            next(): res.redirect('/api/v1/login');
        }

        try {
            const token = req.cookies.bearer_token;
            jwt.verify(token, process.env.TOKEN_SECRET);

            return (req.url == '/login')? 
            res.redirect('/api/v1/blogs'): next();
            
        } catch (error) {
            return (req.url == '/login')?
            next(): res.redirect('/api/v1/login');
        }
    }


    static logout(req, res, next) {
        if(req.session) {
            req.session.destroy((err) => {
                if(err) {
                    console.log(err);
                }
            });
        }
        if(req.cookies) {
            res.clearCookie('bearer_token', {
                httpOnly: false
            });
        }
        res.status(200).json({
            statusCode: 200,
            message: "logged out successfully",
            loginroute: '/api/v1/login'
        });
    }


    static renderLoginView(req, res) {
        res.render('login');
    }


    static renderRegisterView(req, res) {
        res.render('register');
    }


    static async renderMyProfileView(req, res) {
        const response = {};
        response.userinfo = req.session.userinfo;
        res.render('userprofile', { response });
    }


    static async login(req, res) {
        const {username, password} = req.body;
        const [user] = 
        await pool.query('select id, username, password, profile from users where username=:username', { username });
        const pwd_match = await bcrypt.compare(password, user[0]? user[0].password: "");
        if(pwd_match) {
            req.session.userinfo = {
                userid: user[0].id,
                username: user[0].username,
                profile: user[0].profile
            }
            const token = jwt.sign({userid: user[0].id}, process.env.TOKEN_SECRET, {
                expiresIn: 2 * 60 * 60
            });

            res.status(200).cookie('bearer_token', token, {
                httpOnly: true,
                maxAge: 2 * 60 * 60 * 1000
            });
            return res.redirect(`/api/v1/user/${req.session.userinfo.userid}`);

        } else {
            return res.redirect('/api/v1/login');
        }
    }


    static async register(req, res) {
        const {username, password, confirmpassword} = req.body;
        const response = {};

        const [user] = await pool.query('select id from users where username = :username', { username });

        if(user[0]?.id) {
            response.status = 400;
            response.message = 'user already registered';

        } else if(password != confirmpassword) {
            response.status = 400;
            response.message = 'password and confirmpassword do not match';

        } else {
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(password, salt);
            await pool.execute(
                `insert into users (username, password, profile)
                values (:username, :password, :profile)`, {
                username, password: hash, profile: '/uploads/default_profile.png'
            });
            response.status = 201;
            response.message = 'user registered successfully';
        }
        res.status(response.status).json(response);
    }


    static async updateProfile(req, res) {
        const response = {};
        try {
            const filename = path.join('/', 'uploads', req.file.filename);
            await pool.execute(
                `update users set profile = :filename where id = :userid`, {
                    filename, userid: req.session.userinfo.userid
                }
            );
            response.status = 201;
            response.message = "profile updated successfully";
            req.session.userinfo.profile = filename;
            
        } catch (error) {
            response.status = 500;
            response.message = "Something went wrong"
        }
        res.status(response.status).json(response);
    }
}

export default UserController;