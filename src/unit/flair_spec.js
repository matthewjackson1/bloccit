const sequelize = require("../../src/db/models/index").sequelize;
const Topic = require("../../src/db/models").Topic;
const Post = require("../../src/db/models").Post;
const Flair = require("../../src/db/models").Flair;

describe("Flair", () => {

  beforeEach((done) => {
//#1
    this.topic;
    this.post;
    this.flair;
    sequelize.sync({force: true}).then((res) => {

//#2
      Topic.create({
        title: "Expeditions to Alpha Centauri",
        description: "A compilation of reports from recent visits to the star system."
      })
      .then((topic) => {
        this.topic = topic;
//#3
        Post.create({
          title: "My first visit to Proxima Centauri b",
          body: "I saw some rocks.",
//#4
          topicId: this.topic.id
        })
        .then((post) => {
          this.post = post;
          
         Flair.create({
          name:"TestFlair",
          color:"purple"
         }).then((flair) => {
          this.flair = flair;
          done();
         }); 
        })
      })
      .catch((err) => {
        console.log(err);
        done();
      });
    });

  });

  describe("#create()", () => {

     it("should create a flair object with a name and color", (done) => {
//#1
       Flair.create({
         name: "Planet",
         color: "green",
         postId: this.post.id
       })
       .then((flair) => {

//#2
         expect(flair.name).toBe("Planet");
         expect(flair.color).toBe("green");
         done();

       })
       .catch((err) => {
         console.log(err);
         done();
       });
     });

   });


  it("should not create a flair with missing name, color, or assigned post", (done) => {
     Flair.create({
       name: "Country"
     })
     .then((post) => {

      // the code in this block will not be evaluated since the validation error
      // will skip it. Instead, we'll catch the error in the catch block below
      // and set the expectations there

       done();

     })
     .catch((err) => {

       expect(err.message).toContain("Flair.color cannot be null");
       expect(err.message).toContain("Flair.postId cannot be null");
       done();

     })
   });


  describe("#setFlair()", () => {

     it("should associate a flair and a post together", (done) => {

// #1
       Topic.create({
        title: "Expeditions to Alpha Centauri",
        description: "A compilation of reports from recent visits to the star system."
      })
      .then((topic) => {
        this.topic = topic;
//#3
        Post.create( {
         title: "Challenges of interstellar travel",
         description: "1. The Wi-Fi is terrible",
         topicId: this.topic.id
        })
       .then((post) => {
          this.post = post;
          Flair.create({
            name: "Spiders",
            color: "black"
          })
          .then((flair) => {
            expect(this.flair.postId).toBe(this.post.id);
            done();
         });
       })
     });

   });

});
