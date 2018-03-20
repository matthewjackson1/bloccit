const sequelize = require("../../src/db/models/index").sequelize;
const Topic = require("../../src/db/models").Topic;
const Post = require("../../src/db/models").Post;

describe("Topic", () => {

//#1
  let topic, post;

  beforeEach((done) => {
//#2  
    Topic.create({
      title: "Expeditions to Alpha Centauri",
      description: "A compilation of reports from recent visits to the star system."
    })
    .then((res) => {
      topic = res;
//#3
      Post.create({
        title: "My first visit to Proxima Centauri b",
        body: "I saw some rocks.",
//#4
        topicId: topic.id
      })
      .then((res) => {
        post = res;
        done();
      });
    })
    .catch((err) => {
      console.log(err);
      done();
    });

  });

  afterEach((done) => {
    sequelize.sync({force: true}).then((res) => {
      done();
    });
  });

  describe("#create()", () => {

     it("should create a topic object with a title, body, and assigned post", (done) => {
//#1
       Topic.create({
         title: "Pros of Cryosleep during the long journey",
         body: "1. Not having to answer the 'are we there yet?' question.",
         //topicId: topic.id
       })
       .then((post) => {

//#2
         expect(topic.title).toBe("Pros of Cryosleep during the long journey");
         expect(topic.body).toBe("1. Not having to answer the 'are we there yet?' question.");
         //expect(topic.postId).toBe(1);
         done();

       })
       .catch((err) => {
         console.log(err);
         done();
       });
     });

     it("should not create a topic with missing title, body, or assigned post?", (done) => {
       Topic.create({
         title: "Pros of Cryosleep during the long journey"
       })
       .then((post) => {

        // the code in this block will not be evaluated since the validation error
        // will skip it. Instead, we'll catch the error in the catch block below
        // and set the expectations there

         done();

       })
       .catch((err) => {

         expect(err.message).toContain("Topic.body cannot be null");
         //expect(err.message).toContain("Topic.postId cannot be null");
         done();

       })
     });

   });

  describe("#setPosts()", () => {

     it("should associate a post to a topic", (done) => {

// #1
       Post.create({
         title: "Challenges of interstellar travel",
         description: "1. The Wi-Fi is terrible"
       })
       .then((newPost) => {

// #2
         expect(topic.postId).toBe(post.id);
// #3
         post.setTopic(newTopic)
         .then((post) => {
// #4
           expect(post.topicId).toBe(newTopic.id);
           done();

         });
       })
     });

   });

  describe("#getPosts()", () => {

     it("should return the associated posts", (done) => {

       topic.getPosts()
       .then((associatedPosts) => {
         expect(associatedPosts.title).toBe("Expeditions to Alpha Centauri");
         done();
       });

     });

   });

});