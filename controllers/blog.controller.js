import path from 'node:path';
import { pool } from '../db/config.js';

class BlogController {
    static async renderBlogsView(req, res) {
        const response = {};
        response.userinfo = req.session.userinfo;
        try {
            const [blogs] = await pool.query('select id as blogid, title, excerpt, thumbnail from blogs');
            response.statusCode = 200;
            response.blogs = blogs;
            
        } catch (error) {
            response.statusCode = 500;
            response.message = "something went wrong";
        }
        res.render('blogs', { response });
    }


    static async renderCreateBlogView(req, res) {
        const { blogid } = req.params;
        const response = {};
        response.userinfo = req.session.userinfo;
        if(blogid) {
            const [blog] =  await pool.query('select id, title, excerpt, body from blogs where id = :blogid', { blogid });
            response.blog = blog[0];
        }
        res.render('createblog', { response });
    }


    static async renderReadBlogView(req, res) {
        const {id} = req.params;
        const response = {};
        response.userinfo = req.session.userinfo;
        try {
            const [blog] = await pool.query('select id, title, thumbnail, body from blogs where id=:id', { id });
            response.statusCode = 200;
            response.blog = blog[0];
            response.blog.comments = await BlogController.getComments(1, 0, id);
            
        } catch (error) {
            response.statusCode = 500;
            response.message = "something went wrong";
        }
        res.render('readblog', { response });
    }


    static async createBlog(req, res) {
        const {title, excerpt, body, blogid} = req.body;
        const response = {};
        response.userinfo = req.session.userinfo;
        let query = "", params = {};
        const file = path.join('/', 'uploads', req.file.filename);
        if(blogid) {
            query = `update blogs set title=:title, excerpt=:excerpt, body=:body, thumbnail=:thumbnail where id=:blogid`;

            params = {
                title, excerpt, body, thumbnail: file, blogid
            };
            response.message = 'Blog updated successfully';

            
        } else {
            query = 
            `insert into blogs 
                (title, excerpt, body, thumbnail)
            values 
                (:title, :excerpt, :body, :thumbnail)`;

            params = {
                title, excerpt, body, thumbnail: file
            };
            response.message = 'Blog created successfully';          
        }

        try {
            await pool.execute(query, params);
            response.status = 201;
    
        } catch (error) {
            response.status = 500;
            response.message = 'Something went wrong';
        }
        res.status(response.status).json(response);
    }


    static async deleteBlog(req, res) {
        let { blogid } = req.body;
        const response = {};
        response.userinfo = req.session.userinfo;
        try {
            await pool.execute('delete from blogs where id=:blogid', { blogid });
            response.status = 204;
            response.message = 'Blog deleted successfully';
            
        } catch (error) {
            response.status = 500;
            response.message = 'Something went wrong';
        }
        res.status(response.status).json(response);
    }


    static async postComment(req, res) {
        const {comment, parentid, commenttype, blogid} = req.body;
        const response = {};
        response.commenttype = commenttype=='master_comment'? true: false;
        response.userinfo = req.session.userinfo;
        try {
            await pool.execute(
                `insert into comments 
                    (blog_id, comment, is_master_comment, parent_id, username, profile) 
                values 
                    (:blogid, :comment, :commenttype, :parentid, :username, :profile)`, {
                blogid, comment, commenttype: response.commenttype, parentid, username: req.session.userinfo.username, profile: req.session.userinfo.profile
            });
            response.status = 201;
            response.message = 'Comment posted successfully';
            
        } catch (error) {
            response.status = 500;
            response.message = 'Something went wrong';
        }
        res.status(response.status).json(response);
    }


    static async getComments(depth=1, parent_id=0, blogid) {
        // parent_comm_id, cur_comm_id, depth
        let comments = [];
        if(depth == 0) {
            [comments] = await pool.query('select comment, username, profile from comments where blog_id = :blogid and is_master_comment = :is_master_comment order by updated_at desc', { blogid, is_master_comment: true });

        } else {
            [comments] = await pool.query('select id as commentid, comment, username, profile from comments where blog_id = :blogid and parent_id = :parent_id order by updated_at desc', { blogid, parent_id });
        }
        let markup = "";
        for(let i = 0; i < comments.length; i++) {
            markup += 
            `<div class='comment-container' style='padding-left:${depth}rem'>
                <div class='userinfo'>
                    <img src='${comments[i].profile}' class='comment-pic'>
                    <p class='postby'>posted by: ${comments[i].username}</p>
                </div>
                <p class='comment' id='comment-id${comments[i].commentid}'>
                    ${comments[i].comment}
                </p>
                <form method="post" action="/api/v1/comment" class="comment-form">
                    <input type='text' class='comment-input' name='comment'>
                    <input type="hidden" value="sub_comment" name="commenttype">
                    <input type="hidden" value='${comments[i].commentid}' name="parentid">
                    <input type="hidden" value="${blogid}" name="blogid">
                    <button type='submit' class='postreply'>Reply</button>
                </form>`;
                markup += await BlogController.getComments(depth + 1, comments[i].commentid, blogid);
            markup += `</div>`;
        }

        return markup;
    }

}

export default BlogController;