const request = require("request");
const server = require("../../src/server");
const base = "http://localhost:3000/advertisements/";
const sequelize = require("../../src/db/models/index").sequelize;
const advertisementQueries = require("../../src/db/queries.advertisements.js");
const Advertisement = require("../../src/db/models").Advertisement;

describe("routes : advertisements", () => {

  beforeEach((done) => {

      const newAdvertisement = {
        title: "JS Frameworks",
        description: "There is a lot of them"
      };

      advertisementQueries.addAdvertisement(newAdvertisement, (err, advertisement) => {
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

  describe("GET /advertisements", () => {

      it("should return a status code 200", (done) => { 
        request.get(base, (err, res, body) => {
          expect(res.statusCode).toBe(200);
          console.log("test 1");
          done();
          
        });
      });
      
      it("should respond with all advertisements", (done) => {
        request.get(base, (err, res, body) => {
          expect(err).toBeNull();
          expect(body).toContain("Advertisements");
          expect(body).toContain("JS Frameworks");
          console.log("test 2");
          done();
        });
      });
       
  });

  describe("GET /advertisements/new", () => {

    it("should return a status code 200", (done) => {
      request.get(`${base}new`, (err, res, body) => {
        expect(res.statusCode).toBe(200);
        done();
      });
    });

    it("should render a new advertisement form", (done) => {
      request.get(`${base}new`, (err, res, body) => {
        expect(err).toBeNull();
        expect(body).toContain("New Advertisement");
        done();
      });
    });

  });

  describe("POST /advertisements/create", () => {

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

      it("should create a new advertisement and redirect", (done) => {
        request.post(
          {
            url: `${base}create`,
            form: {
              title: "blink-182 songs",
              description: "What's your favorite blink-182 song?"
            }
          },
          (err, res, body) => {
            Advertisement.findOne({where: {title: "blink-182 songs"}})
            .then((advertisement) => {
                expect(advertisement.title).toBe("blink-182 songs");
                expect(advertisement.description).toBe("What's your favorite blink-182 song?");
                done();
            })
            .catch((err) => {
              console.log(err);
              done();
            });
          });
      });

    });

   describe("GET /advertisements/:id", () => {

     it("should return a status code 200", (done) => {
       request.get(`${base}1`, (err, res, body) => {
         expect(res.statusCode).toBe(200);
         done();
       });
     });

     it("should render a view with the selected advertisement", (done) => {
       request.get(`${base}1`, (err, res, body) => {
         expect(err).toBeNull();
         expect(body).toContain("JS Frameworks");
         done();
       });
     });

   });


  describe("POST /advertisements/:id/destroy", () => {

     it("should return a status code 303", (done) => {

 //#1
       request.post(`${base}1/destroy`, (err, res, body) => {
         expect(res.statusCode).toBe(303);
         done();
       });
     });

     it("should delete the advertisement with the associated ID", (done) => {

 //#2
       Advertisement.all()
       .then((advertisements) => {

 //#3
         const advertisementCountBeforeDelete = advertisements.length;

         expect(advertisementCountBeforeDelete).toBe(1);

 //#4
         request.post(`${base}1/destroy`, (err, res, body) => {
           Advertisement.all()
           .then((advertisements) => {
             expect(err).toBeNull();
             expect(advertisements.length).toBe(advertisementCountBeforeDelete - 1);
             done();
           })

         });
       });

     });
   });

     describe("GET /advertisements/:id/edit", () => {

     it("should return a status code 200", (done) => {
       request.get(`${base}1/edit`, (err, res, body) => {
         expect(res.statusCode).toBe(200);
         done();
       });
     });

     it("should render a view with an edit advertisement form", (done) => {
       request.get(`${base}1/edit`, (err, res, body) => {
         expect(err).toBeNull();
         expect(body).toContain("Edit Advertisement");
         expect(body).toContain("JS Frameworks");
         done();
       });
     });

   });

  

  describe("POST /advertisements/:id/update", () => {

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

     it("should update the advertisement with the given values", (done) => {

//#1
         request.post({
           url: `${base}1/update`,
           form: {
             title: "JavaScript Frameworks"
           }
         }, (err, res, body) => {

           expect(err).toBeNull();
//#2
           Advertisement.findOne({
             where: {id:1}
           })
           .then((advertisement) => {
             expect(advertisement.title).toBe("JavaScript Frameworks");
             done();
           });
         });
     });

   });


 });