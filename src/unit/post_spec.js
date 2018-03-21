const sequelize = require("../../src/db/models/index").sequelize;
const Topic = require("../../src/db/models").Topic;
const Post = require("../../src/db/models").Post;

describe("Post", () => {

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

     it("should create a post object with a title, body, and assigned topic", (done) => {
//#1
       Post.create({
         title: "Pros of Cryosleep during the long journey",
         body: "1. Not having to answer the 'are we there yet?' question.",
         topicId: topic.id
       })
       .then((post) => {

//#2
         expect(post.title).toBe("Pros of Cryosleep during the long journey");
         expect(post.body).toBe("1. Not having to answer the 'are we there yet?' question.");
         expect(post.topicId).toBe(1);
         done();

       })
       .catch((err) => {
         console.log(err);
         done();
       });
     });

     it("should not create a post with missing title, body, or assigned topic", (done) => {
       Post.create({
         title: "Pros of Cryosleep during the long journey"
       })
       .then((post) => {

        // the code in this block will not be evaluated since the validation error
        // will skip it. Instead, we'll catch the error in the catch block below
        // and set the expectations there

         done();

       })
       .catch((err) => {

         expect(err.message).toContain("Post.body cannot be null");
         expect(err.message).toContain("Post.topicId cannot be null");
         done();

       })
     });

   });

  describe("#setTopic()", () => {

     it("should associate a topic and a post together", (done) => {

// #1
       Topic.create({
         title: "Challenges of interstellar travel",
         description: "1. The Wi-Fi is terrible"
       })
       .then((newTopic) => {

// #2
         expect(post.topicId).toBe(topic.id);
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

  describe("#getTopic()", () => {

     it("should return the associated topic", (done) => {

       post.getTopic()
       .then((associatedTopic) => {
         expect(associatedTopic.title).toBe("Expeditions to Alpha Centauri");
         done();
       });

     });

   });
   

});