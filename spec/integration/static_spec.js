const request = require("request");
const server = require("../../src/server");
const base = "http://localhost:3000/";

describe("routes : static", () => {

//#1
    describe("GET /", () => {

//#2
    it("should return status code 200", () => {

//#3
      request.get(base, (err, res, body) => {
        expect(res.statusCode).toBe(200);
        });
      });

    });

    describe("GET /marco", () => {
    it("should return status code 200 and body should be 'Polo'", () => {
      request.get("http://localhost:3000/marco", (err, res, body) => {
        expect(res.statusCode).toBe(200);
        expect(res.body).toBe("polo");
        });
      });

    });
  });