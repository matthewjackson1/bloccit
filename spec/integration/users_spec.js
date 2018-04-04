const request = require("request");
const server = require("../../src/server");
const base = "http://localhost:3000/users/";
const User = require("../../src/db/models").User;
const sequelize = require("../../src/db/models/index").sequelize;
const Topic = require("../../src/db/models").Topic;
const Post = require("../../src/db/models").Post;
const Comment = require("../../src/db/models").Comment;
const Favorite = require("../../src/db/models").Favorite;

describe("routes : users", () => {

  beforeEach((done) => {

    sequelize.sync({force: true})
    .then(() => {
      done();
    })
    .catch((err) => {
      console.log(err);
      done();
    });

  });

  describe("GET /users/sign_up", () => {

    it("should render a view with a sign up form", (done) => {
      request.get(`${base}sign_up`, (err, res, body) => {
        expect(err).toBeNull();
        expect(body).toContain("Sign up");
        done();
      });
    });

  });

  describe("POST /users", () => {

// #1
    it("should create a new user with valid values and redirect", (done) => {

      const options = {
        url: base,
        form: {
          email: "user@example.com",
          password: "123456789"
        }
      }

      request.post(options,
        (err, res, body) => {

// #2
          User.findOne({where: {email: "user@example.com"}})
          .then((user) => {
            expect(user).not.toBeNull();
            expect(user.email).toBe("user@example.com");
            expect(user.id).toBe(1);
            done();
          })
          .catch((err) => {
            console.log(err);
            done();
          });
        }
      );
    });

// #3
    it("should not create a new user with invalid attributes and redirect", (done) => {
      request.post(
        {
          url: base,
          form: {
            email: "no",
            password: "123456789"
          }
        },
        (err, res, body) => {
          User.findOne({where: {email: "no"}})
          .then((user) => {
            expect(user).toBeNull();
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

  describe("GET /users/sign_in", () => {

     it("should render a view with a sign in form", (done) => {
       request.get(`${base}sign_in`, (err, res, body) => {
         expect(err).toBeNull();
         expect(body).toContain("Sign in");
         done();
       });
     });

   });

   describe("GET /users/:id", () => {

    beforeEach((done) => {
// #3
      this.user;
      this.user2;
      this.post;
      this.post2;
      this.comment;
      this.topic;

      User.create({
        email: "starman@tesla.com",
        password: "Trekkie4lyfe"
      })
      .then((res) => {
        this.user = res;

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
        .then((res) => {
          this.post = res.posts[0];
          
          Comment.create({
            body: "This comment is alright.",
            postId: this.post.id,
            userId: this.user.id
          })
          .then((res) => {
            console.log(5);
            this.comment = res;
            User.create({
              email: "elon@tesla.com",
              password: "Trekkie4lyfe"
            })
            .then((user2) => {
              this.user2 = user2;
      
              Post.create({
                title: "Dumbo the Elephant",
                body: "Everything you ever wanted to know about the Disney Character",
                topicId: 1,
                userId: this.user2.id
       
              })
              .then((post2) => {        
                Favorite.create({
                    postId: post2.id,
                    userId: 1
                  }).then((fav) => {
                    console.log("fav created");
                    done();
                  })
                })
              })
          })
        })
      })
     });

    

// #4
    it("should present a list of comments and posts a user has created, as well as the articles they've favourited", (done) => {

      request.get(`${base}${this.user.id}`, (err, res, body) => {

// #5
        expect(body).toContain("Snowball Fighting");
        expect(body).toContain("This comment is alright.");
        expect(body).toContain("Dumbo the Elephant");
        done();
      });

    });


  });

});