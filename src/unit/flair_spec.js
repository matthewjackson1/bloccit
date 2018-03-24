const sequelize = require("../../src/db/models/index").sequelize;
const Topic = require("../../src/db/models").Topic;
const Post = require("../../src/db/models").Post;

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
          	name: "News",
          	color: "blue",
          })
          .then((flair) => {
          	this.flair = flair;
          	done();
          })

          })

      })
      .catch((err) => {
        console.log(err);
        done();
      });
    });

  });


   describe("#create()", () => {

     it("should create a flair object with a name and colour", (done) => {

       Flair.create({
         name: "Celebrities",
         color: "red",
       })
       .then((flair) => {

         expect(flair.name).toBe("Celebrities");
         expect(flair.color).toBe("red");
         done();

       })
       .catch((err) => {
         console.log(err);
         done();
       });
     });

     it("should not create a flair with missing name or color", (done) => {
       Flair.create({
         
       })
       .then((flair) => {

        // the code in this block will not be evaluated since the validation error
        // will skip it. Instead, we'll catch the error in the catch block below
        // and set the expectations there

         done();

       })
       .catch((err) => {

         expect(err.message).toContain("Flair.name cannot be null");
         expect(err.message).toContain("Flair.color cannot be null");
         done();

       })
     });

   });

   describe("#setFlair()", () => {

     it("should associate a flair with a post", (done) => {

// #1 // IS THIS RIGHT? SHOULD I BE SETTING FLAIR ON A POST OR POST ON A FLAIR?
       Flair.create({
         name: "Celebrities",
         color: "red",
       })
       .then((flair) => {

     	 post.setFlair(flair)
         
         .then((post) => {
           expect(post.flairs).toContain(flair);
           done();

         });
       })
     });

   });

  describe("#getFlair()", () => {

     it("should return the associated flair(s)", (done) => {

       post.getFlair()
       .then((associatedTopic) => {
         expect(associatedTopic.title).toBe("Expeditions to Alpha Centauri");
         done();
       });

     });

   });

});
