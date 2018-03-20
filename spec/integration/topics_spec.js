const request = require("request");
const server = require("../../src/server");
const base = "http://localhost:3000/topics/";
const sequelize = require("../../src/db/models/index").sequelize;
const topicQueries = require("../../src/db/queries.topics.js");
const Topic = require("../../src/db/models").Topic;


describe("routes : topics", () => {

  beforeEach((done) => {

      const newTopic = {
        title: "JavaScript Frameworks",
        description: "There is a lot of them"
      };

      topicQueries.addTopic(newTopic, (err, topic) => {
        done();
      })
      .catch((err) => {
        console.log(err);
        done();
      })

  });

  afterEach((done) => {
      sequelize.sync({force: true}).then((res) => {
        done();
      });
  });

  describe("GET /topics", () => {

      it("should return a status code 200", (done) => { 
        request.get(base, (err, res, body) => {
          expect(res.statusCode).toBe(200);
          console.log("test 1");
          done();
          
        });
      });
      
      it("should respond with all topics", (done) => {
        request.get(base, (err, res, body) => {
          expect(err).toBeNull();
          expect(body).toContain("Topics");
          expect(body).toContain("JavaScript Frameworks");
          console.log("test 2");
          done();
        });
      });
       
  });

  describe("GET /topics/new", () => {

   it("should return a status code 200", (done) => {
      request.get(`${base}new`, (err, res, body) => {
        expect(res.statusCode).toBe(200);
        done();
      });
    });

   
   it("should render a new topic form", (done) => {
      request.get(`${base}new`, (err, res, body) => {
        expect(err).toBeNull();
        expect(body).toContain("New Topic");
        done();
      });
    });

  });

   describe("POST /topics/create", () => {

      it("should return a status code 303", (done) => {
        request.post(
          {
            url: `${base}create`,
            form: {
              title: "blink-182 songs",
              description: "What's your favorite blink-182 song?"
            }
          },
          (err, res, body) => {
            expect(res.statusCode).toBe(303);
            done();
          });
      });

      it("should create a new topic and redirect", (done) => {
        request.post(
          {
            url: `${base}create`,
            form: {
              title: "blink-182 songs",
              description: "What's your favorite blink-182 song?"
            }
          },
          (err, res, body) => {
            Topic.findOne({where: {title: "blink-182 songs"}})
            .then((topic) => {
                expect(topic.title).toBe("blink-182 songs");
                expect(topic.description).toBe("What's your favorite blink-182 song?");
                done();
            })
            .catch((err) => {
              console.log(err);
              done();
            });
          });
      });

    });

   describe("GET /topics/:id", () => {

     it("should return a status code 200", (done) => {
       request.get(`${base}1`, (err, res, body) => {
         expect(res.statusCode).toBe(200);
         done();
       });
     });

     it("should render a view with the selected topic", (done) => {
       request.get(`${base}1`, (err, res, body) => {
         expect(err).toBeNull();
         expect(body).toContain("JavaScript Frameworks");
         done();
       });
     });

   });

  

  describe("POST /topics/:id/destroy", () => {

     it("should return a status code 303", (done) => {
       request.post(`${base}1/destroy`, (err, res, body) => {
         expect(res.statusCode).toBe(303);
         done();
       });
     });

     it("should delete the topic with the associated ID", (done) => {
       Topic.all()
       .then((topics) => {

         const topicCountBeforeDelete = topics.length;
         expect(topicCountBeforeDelete).toBe(1);

         request.post(`${base}1/destroy`, (err, res, body) => {
           Topic.all()
           .then((topics) => {
             expect(err).toBeNull();
             expect(topics.length).toBe(topicCountBeforeDelete - 1);
             done();
           })

         });
       });

     });

  });

  describe("GET /topics/:id/edit", () => {

     it("should return a status code 200", (done) => {
       request.get(`${base}1/edit`, (err, res, body) => {
         expect(res.statusCode).toBe(200);
         done();
       });
     });

     it("should render a view with an edit topic form", (done) => {
       request.get(`${base}1/edit`, (err, res, body) => {
         expect(err).toBeNull();
         expect(body).toContain("Edit Topic");
         expect(body).toContain("JavaScript Frameworks");
         done();
       });
     });

   });

   

  describe("POST /topics/:id/update", () => {

     it("should return a status code 302", (done) => {
       request.post({
         url: `${base}1/update`,
         form: {
           title: "JavaScript Frameworks"
         }
       }, (err, res, body) => {
         expect(res.statusCode).toBe(302);
         done();
       });
     });

     it("should update the topic with the given values", (done) => {

         request.post({
           url: `${base}1/update`,
           form: {
             title: "JavaScript Frameworks"
           }
         }, (err, res, body) => {

           expect(err).toBeNull();
           Topic.findOne({
             where: {id:1}
           })
           .then((topic) => {
             expect(topic.title).toBe("JavaScript Frameworks");
             done();
           });
         });
     });

   });

});


 