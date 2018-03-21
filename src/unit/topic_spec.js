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

     it("should create a topic object with a title and description", (done) => {
//#1
       Topic.create({
         title: "Space Travel",
         description: "Everything to do with space travel",
       })
       .then((topic) => {

//#2
         expect(topic.title).toBe("Space Travel");
         expect(topic.description).toBe("Everything to do with space travel");
         //expect(topic.postId).toBe(1);
         done();

       })
       .catch((err) => {
         console.log(err);
         done();
       });
     });
     
     it("should not create a topic with missing title or description", (done) => {
       Topic.create({
         title: "Science"
       })
       .then((topic) => {
        // the code in this block will not be evaluated since the validation error
        // will skip it. Instead, we'll catch the error in the catch block below
        // and set the expectations there

         done();

       })
       .catch((err) => {
         expect(err.message).toContain("Topic.description cannot be null");

         done();

       })
     });
  
   });



  describe("#getPosts()", () => {

     it("should return the associated topic", (done) => {

       topic.getPosts()
       .then((posts) => {
         expect(posts[0].title).toBe("My first visit to Proxima Centauri b");
         done();
       });

     });

   });

});