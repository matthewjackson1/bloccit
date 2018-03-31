const request = require("request");
const server = require("../../src/server");
const base = "http://localhost:3000/topics";
const sequelize = require("../../src/db/models/index").sequelize;
const Topic = require("../../src/db/models").Topic;
const Post = require("../../src/db/models").Post;
const User = require("../../src/db/models").User;

describe("routes : posts", () => {

  beforeEach((done) => {
     this.topic;
     this.post;
     this.user;

     sequelize.sync({force: true}).then((res) => {
       User.create({
         email: "starman@tesla.com",
         password: "Trekkie4lyfe"
       })
       .then((user) => {
         this.user = user;

         Topic.create({
           title: "Winter Games",
           description: "Post your Winter Games stories.",
           posts: [{
             title: "Snowball Fighting",
             body: "So much snow!",
             userId: this.user.id
           }]
         }, {
           include: {
            model: Post,
            as: "posts"
           }
         })
         .then((topic) => {
           this.topic = topic;
           this.post = topic.posts[0];
           done();
         })
       })
     });

   });
  
  // All users can read posts 
  describe("GET /topics/:topicId/posts/:id", () => {

    it("should render a view with the selected post", (done) => {
      request.get(`${base}/${this.topic.id}/posts/${this.post.id}`, (err, res, body) => {
        expect(err).toBeNull();
        expect(body).toContain("Snowball Fighting");
        done();
      });
    });

  });

  //member - amend tests to be successful for create and new but not edit, update, destroy
  describe("member CRUD post", () => {
    beforeEach((done) => {
      User.create({
        email: "admin@example.com",
        password: "123456"
      })
      .then((user) => {
        request.get({         // mock authentication
          url: "http://localhost:3000/auth/fake",
          form: {
            role: user.role,     // mock authenticate as admin user
            userId: user.id,
            email: user.email
          }
        });
        done();
      });
    });
 
    //should not work
    describe("POST /topics/:topicId/posts/:id/update", () => {
      
      it("should not update the post with the given values", (done) => {
          const options = {
            url: `${base}/${this.topic.id}/posts/${this.post.id}/update`,
            form: {
              title: "Snowman Building Competition",
              body: "I love watching them melt slowly."
            }
          };
          request.post(options,
            (err, res, body) => {
 
            expect(err).toBeNull();
 
            Post.findOne({
              where: {id: this.post.id}
            })
            .then((post) => {
              expect(post.title).toBe("Snowball Fighting");
              done();
            });
          });
      });
     
    });
 
   
   describe("GET /topics/:topicId/posts/new", () => {
 
     it("should render a new post form", (done) => {
       request.get(`${base}/${this.topic.id}/posts/new`, (err, res, body) => {
         expect(err).toBeNull();
         expect(body).toContain("New Post");
         done();
       });
     });
 
   });
 
   describe("POST /topics/:topicId/posts/create", () => {
 
    it("should create a new post and redirect", (done) => {
       const options = {
         url: `${base}/${this.topic.id}/posts/create`,
         form: {
           title: "Watching snow melt",
           body: "Without a doubt my favoriting things to do besides watching paint dry!"
         }
       };
       request.post(options,
         (err, res, body) => {
 
           Post.findOne({where: {title: "Watching snow melt"}})
           .then((post) => {
             expect(post).not.toBeNull();
             expect(post.title).toBe("Watching snow melt");
             expect(post.body).toBe("Without a doubt my favoriting things to do besides watching paint dry!");
             expect(post.topicId).not.toBeNull();
             done();
           })
           .catch((err) => {
             console.log(err);
             done();
           });
         }
       );
     });
 
     it("should not create a new post that fails validations", (done) => {
        const options = {
          url: `${base}/${this.topic.id}/posts/create`,
          form: {
 
 //#1
            title: "a",
            body: "b"
          }
        };
 
        request.post(options,
          (err, res, body) => {
 
 //#2
            Post.findOne({where: {title: "a"}})
            .then((post) => {
                expect(post).toBeNull();
                done();
            })
            .catch((err) => {
              console.log(err);
              done();
            });
          }
        );
      });
 
  });
 
   //should not work
   describe("POST /topics/:topicId/posts/:id/destroy", () => {
 
      it("should not delete the post with the associated ID", (done) => {
 
 //#1   
        expect(this.post.id).toBe(1);
        let titleBeforeDelete = this.post.title;
        let bodyBeforeDelete = this.post.body;
        request.post(`${base}/${this.topic.id}/posts/${this.post.id}/destroy`, (err, res, body) => {
 
 //#2
          Post.findById(1)
          .then((post) => {
            expect(post.title).toBe(titleBeforeDelete);
            expect(post.body).toBe(bodyBeforeDelete);
            done();
          })
        });
 
      });
 
    });
   
  //should not work
   describe("GET /topics/:topicId/posts/:id/edit", () => {
 
      it("should not render a view with an edit post form", (done) => {
        request.get(`${base}/${this.topic.id}/posts/${this.post.id}/edit`, (err, res, body) => {
          expect(err).toBeNull();
          expect(body).not.toContain("Edit Post");
          expect(body).toContain("Snowball Fighting"); //confirm redirect to topic page
          done();
        });
      });
 
    });

  });

  // owner - all tests below should pass as they are 
  describe("owner CRUD own post", () => {
    let ownerTopic;
    let ownerPost;
    beforeEach((done) => {
      User.create({
        email: "owner@example.com",
        password: "123456",
      })
      .then((user) => {
        request.get({       
          url: "http://localhost:3000/auth/fake",
          form: {
            role: user.role,     // mock authenticate as user
            userId: user.id,
            email: user.email
          }
        });
          Topic.create({
            title: "Funnies",
            description: "This topic will make you laugh",
            posts: [{
              title: "Funny Post 1",
              body: "Why did the chicken cross the road? To get to the other side!",
              userId: user.id
            }]
          }, {
            include: {
             model: Post,
             as: "posts"
            }
          })
          .then((topic) => {
            ownerTopic = topic;
            ownerPost = topic.posts[0];
            done();
          })
        })
    });
    //
    describe("POST /topics/:topicId/posts/:id/update", () => {

      it("should return a status code 302", (done) => {
        request.post({
          url: `${base}/${ownerTopic.id}/posts/${ownerPost.id}/update`,
          form: {
            title: "Funny Post 2",
            body: "Knock Knock Who's There?"
          }
        }, (err, res, body) => {
          expect(res.statusCode).toBe(302);
          done();
        });
      });
      
      it("should update the post with the given values", (done) => {
          const options = {
            url: `${base}/${ownerTopic.id}/posts/${ownerPost.id}/update`,
            form: {
              title: "Funny Post 2",
              body: "Knock Knock Who's There?"
            }
          };
          request.post(options,
            (err, res, body) => {
 
            expect(err).toBeNull();
 
            Post.findOne({
              where: {id: ownerPost.id}
            })
            .then((post) => {
              expect(post.title).toBe("Funny Post 2");
              done();
            });
          });
      });
     
    });

    describe("GET /topics/:topicId/posts/:id/edit", () => {
 
      it("should render a view with an edit post form", (done) => {
        request.get(`${base}/${ownerTopic.id}/posts/${ownerPost.id}/edit`, (err, res, body) => {
          expect(err).toBeNull();
          expect(body).toContain("Edit Post");
          expect(body).toContain("Why did the chicken cross the road? To get to the other side!");
          done();
        });
      });
 
    });
 
 
   describe("GET /topics/:topicId/posts/new", () => {
 
     it("should render a new post form", (done) => {
       request.get(`${base}/${this.topic.id}/posts/new`, (err, res, body) => {
         expect(err).toBeNull();
         expect(body).toContain("New Post");
         done();
       });
     });
 
   });
 
   describe("POST /topics/:topicId/posts/create", () => {
 
    it("should create a new post and redirect", (done) => {
       const options = {
         url: `${base}/${this.topic.id}/posts/create`,
         form: {
           title: "Watching snow melt",
           body: "Without a doubt my favoriting things to do besides watching paint dry!"
         }
       };
       request.post(options,
         (err, res, body) => {
 
           Post.findOne({where: {title: "Watching snow melt"}})
           .then((post) => {
             expect(post).not.toBeNull();
             expect(post.title).toBe("Watching snow melt");
             expect(post.body).toBe("Without a doubt my favoriting things to do besides watching paint dry!");
             expect(post.topicId).not.toBeNull();
             done();
           })
           .catch((err) => {
             console.log(err);
             done();
           });
         }
       );
     });
 
     it("should not create a new post that fails validations", (done) => {
        const options = {
          url: `${base}/${this.topic.id}/posts/create`,
          form: {
 
 //#1
            title: "a",
            body: "b"
          }
        };
 
        request.post(options,
          (err, res, body) => {
 
 //#2
            Post.findOne({where: {title: "a"}})
            .then((post) => {
                expect(post).toBeNull();
                done();
            })
            .catch((err) => {
              console.log(err);
              done();
            });
          }
        );
      });
 
  });
 
 
   describe("POST /topics/:topicId/posts/:id/destroy", () => {
 
      it("should delete the post with the associated ID", (done) => {
        expect(ownerPost.id).toBe(2);

        request.post(`${base}/${ownerTopic.id}/posts/${ownerPost.id}/destroy`, (err, res, body) => {

          Post.findById(2)
          .then((post) => {
            expect(err).toBeNull();
            expect(post).toBeNull();
            done();
          })
        });
 
      });
 
    });
 
  
  
  });

    // admin - all tests below should pass as they are
    describe("member CRUD post", () => {
      beforeEach((done) => {
        User.create({
          email: "admin@example.com",
          password: "123456",
          role: "admin"
        })
        .then((user) => {
          request.get({         // mock authentication
            url: "http://localhost:3000/auth/fake",
            form: {
              role: user.role,     // mock authenticate as admin user
              userId: user.id,
              email: user.email
            }
          });
          done();
        });
      });
  
      describe("POST /topics/:topicId/posts/:id/update", () => {

        it("should return a status code 302", (done) => {
          request.post({
            url: `${base}/${this.topic.id}/posts/${this.post.id}/update`,
            form: {
              title: "Snowman Building Competition",
              body: "I love watching them melt slowly."
            }
          }, (err, res, body) => {
            expect(res.statusCode).toBe(302);
            done();
          });
        });
        
        it("should update the post with the given values", (done) => {
            const options = {
              url: `${base}/${this.topic.id}/posts/${this.post.id}/update`,
              form: {
                title: "Snowman Building Competition",
                body: "I love watching them melt slowly."
              }
            };
            request.post(options,
              (err, res, body) => {
   
              expect(err).toBeNull();
   
              Post.findOne({
                where: {id: this.post.id}
              })
              .then((post) => {
                expect(post.title).toBe("Snowman Building Competition");
                done();
              });
            });
        });
       
      });
   
   
     describe("GET /topics/:topicId/posts/new", () => {
   
       it("should render a new post form", (done) => {
         request.get(`${base}/${this.topic.id}/posts/new`, (err, res, body) => {
           expect(err).toBeNull();
           expect(body).toContain("New Post");
           done();
         });
       });
   
     });
   
     describe("POST /topics/:topicId/posts/create", () => {
   
      it("should create a new post and redirect", (done) => {
         const options = {
           url: `${base}/${this.topic.id}/posts/create`,
           form: {
             title: "Watching snow melt",
             body: "Without a doubt my favoriting things to do besides watching paint dry!"
           }
         };
         request.post(options,
           (err, res, body) => {
   
             Post.findOne({where: {title: "Watching snow melt"}})
             .then((post) => {
               expect(post).not.toBeNull();
               expect(post.title).toBe("Watching snow melt");
               expect(post.body).toBe("Without a doubt my favoriting things to do besides watching paint dry!");
               expect(post.topicId).not.toBeNull();
               done();
             })
             .catch((err) => {
               console.log(err);
               done();
             });
           }
         );
       });
   
       it("should not create a new post that fails validations", (done) => {
          const options = {
            url: `${base}/${this.topic.id}/posts/create`,
            form: {
   
   //#1
              title: "a",
              body: "b"
            }
          };
   
          request.post(options,
            (err, res, body) => {
   
   //#2
              Post.findOne({where: {title: "a"}})
              .then((post) => {
                  expect(post).toBeNull();
                  done();
              })
              .catch((err) => {
                console.log(err);
                done();
              });
            }
          );
        });
   
    });
   
   
     describe("POST /topics/:topicId/posts/:id/destroy", () => {
   
        it("should delete the post with the associated ID", (done) => {
   
   //#1
          expect(this.post.id).toBe(1);
   
          request.post(`${base}/${this.topic.id}/posts/${this.post.id}/destroy`, (err, res, body) => {
   
   //#2
            Post.findById(1)
            .then((post) => {
              expect(err).toBeNull();
              expect(post).toBeNull();
              done();
            })
          });
   
        });
   
      });
   
     describe("GET /topics/:topicId/posts/:id/edit", () => {
   
        it("should render a view with an edit post form", (done) => {
          request.get(`${base}/${this.topic.id}/posts/${this.post.id}/edit`, (err, res, body) => {
            expect(err).toBeNull();
            expect(body).toContain("Edit Post");
            expect(body).toContain("Snowball Fighting");
            done();
          });
        });
   
      });
    });



  

  
  });

