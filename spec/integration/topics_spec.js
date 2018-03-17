const request = require("request");
const server = require("../../src/server");
const base = "http://localhost:3000/topics/";
const sequelize = require("../db/models/index").sequelize;
const topicQueries = require("../../src/db/queries.topics.js");

  describe("routes : topics", () => {

  beforeEach((done) => {

      const newTopic = {
        title: "JS Frameworks",
        description: "There is a lot of them"
      };

//#1
      topicQueries.addTopic(newTopic, (err, topic) => {
        done();
      })
      .catch((err) => {
        console.log(err);
        done();
      })

    });

//#2
    afterEach((done) => {
      sequelize.sync({force: true}).then((res) => {
        done();
      });
    });

    describe("GET /topics", () => {

      it("should return a status code 200", (done) => {
            it("should respond with all topics", (done) => {

//#3
        request.get(base, (err, res, body) => {
          expect(err).toBeNull();
          expect(body).toContain("Topics");
          expect(body).toContain("JS Frameworks");
          done();
        });
      });
    });
        request.get(base, (err, res, body) => {
          expect(res.statusCode).toBe(200);
          done();
        });
      });

    });
  });