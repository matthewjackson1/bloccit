const postQueries = require("../db/queries.posts.js");

module.exports = {
   create(req, res, next){
     res.render("posts/new", {topicId: req.params.topicId});
   },


   show(req, res, next){
     postQueries.getPost(req.params.id, (err, post) => {
       if(err || post == null){
         res.redirect(404, "/");
       } else {
         res.render("posts/show", {post});
       }
     });
   },

   destroy(req, res, next){
     postQueries.deletePost(req.params.id, (err, deletedRecordsCount) => {
       if(err){
         res.redirect(500, `/topics/${req.params.topicId}/posts/${req.params.id}`)
       } else {
         res.redirect(303, `/topics/${req.params.topicId}`)
       }
     });
   },

   edit(req, res, next){
     postQueries.getPost(req.params.id, (err, post) => {
       if(err || post == null){
         res.redirect(404, "/");
       } else {
         res.render("posts/edit", {post});
       }
     });
   },

   update(req, res, next){
     postQueries.updatePost(req.params.id, req.body, (err, post) => {
       if(err || post == null){
         res.redirect(404, `/topics/${req.params.topicId}/posts/${req.params.id}/edit`);
       } else {
         res.redirect(`/topics/${req.params.topicId}/posts/${req.params.id}`);
       }
     });
   }
	
}