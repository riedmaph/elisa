var path = require('path');


//Require the dev-dependencies
var chai = require('chai');
var chaiHttp = require('chai-http');
var app = require('../app');
var should = chai.should();

chai.use(chaiHttp);

var dbhandler = require(path.join('..', 'test', 'dbhandler', 'dbhandler'));

var token;

//IDs hardcoded according to setUpMoveItems.sql
var listid = '5c7397aa-b249-11e6-b98b-000c29c17dad';
var itemid1 = '5c7397aa-b249-11e6-b98b-001c29c17dad';
var itemid5 = '5c7397aa-b249-11e6-b98b-005c29c17dad';

describe('Optimise', () => {
  before((done) => {
    var user = {
                email: "test@test.de",
                password: "testpass"
              }

    dbhandler.setOptimisation((err) => {   
      chai.request(app)
        .post('/api/users/login')
        .send(user)
        .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('token');
            token = res.body.token;                         
                  done();
        });
    });
  });

  describe('/Get optimised list by price', () => {
    it('it should return 5 items with 3 having offers', (done) => {
      chai.request(app)
          .get('/api/lists/'+listid+'/optimised?by=price')
          .set('x-access-token', token)
          .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.a('object');
              res.body.should.have.property('items');
              res.body.items.should.be.a('array');
              res.body.items.length.should.be.eql(5);
              res.body.items.should.deep.equal(
                [
                  {
                    "id": "5c7397aa-b249-11e6-b98b-001c29c17dad",
                    "position": 0,
                    "name": "Bananen",
                    "offerAlgorithm": null,
                    "amount": 10,
                    "unit": "Stk",
                    "offers": []
                  },
                  {
                    "id": "5c7397aa-b249-11e6-b98b-002c29c17dad",
                    "position": 1,
                    "name": "Hühnerfilet",
                    "offerAlgorithm": null,
                    "amount": 350,
                    "unit": "g",
                    "offers": []
                  },
                  {
                    "id": "5c7397aa-b249-11e6-b98b-003c29c17dad",
                    "position": 2,
                    "name": "Bier",
                    "offerAlgorithm": 738388,
                    "amount": 3,
                    "unit": "Stk",
                    "offers": [
                      {
                        "id": 738388,
                        "market": 13395,
                        "offerprice": 10.99,
                        "offerfrom": "2016-12-03T08:00:00.000Z",
                        "offerto": "2016-12-10T08:00:00.000Z",
                        "discount": "-30%",
                        "isOptimium": true,
                        "article": {
                          "name": "Weissbier",
                          "brand": "Franziskaner"
                        }
                      },
                      {
                        "id": 812347,
                        "market": 13395,
                        "offerprice": 11.49,
                        "offerfrom": "2016-12-03T08:00:00.000Z",
                        "offerto": "2016-12-10T08:00:00.000Z",
                        "discount": "-17%",
                        "isOptimium": false,
                        "article": {
                          "name": "Kellerbier",
                          "brand": "Mönchshof"
                        }
                      }
                    ]
                  },
                  {
                    "id": "5c7397aa-b249-11e6-b98b-004c29c17dad",
                    "position": 3,
                    "name": "Eier",
                    "offerAlgorithm": 802001,
                    "amount": 10,
                    "unit": "Stk",
                    "offers": [
                      {
                        "id": 802001,
                        "market": 16119,
                        "offerprice": 0.95,
                        "offerfrom": "2016-12-03T08:00:00.000Z",
                        "offerto": "2016-12-10T08:00:00.000Z",
                        "discount": null,
                        "isOptimium": true,
                        "article": {
                          "name": "Eierspätzle",
                          "brand": "ja!"
                        }
                      }
                    ]
                  },
                  {
                    "id": "5c7397aa-b249-11e6-b98b-005c29c17dad",
                    "position": 4,
                    "name": "Kaffee",
                    "offerAlgorithm": 812359,
                    "amount": 150,
                    "unit": "g",
                    "offers": [
                      {
                        "id": 802005,
                        "market": 16119,
                        "offerprice": 3.88,
                        "offerfrom": "2016-12-03T08:00:00.000Z",
                        "offerto": "2016-12-10T08:00:00.000Z",
                        "discount": "-38%",
                        "isOptimium": false,
                        "article": {
                          "name": "Kaffee",
                          "brand": "Mövenpick"
                        }
                      },
                      {
                        "id": 812359,
                        "market": 13395,
                        "offerprice": 3.88,
                        "offerfrom": "2016-12-03T08:00:00.000Z",
                        "offerto": "2016-12-10T08:00:00.000Z",
                        "discount": "-38%",
                        "isOptimium": true,
                        "article": {
                          "name": "Kaffee",
                          "brand": "Mövenpick"
                        }
                      },
                      {
                        "id": 812365,
                        "market": 13395,
                        "offerprice": 1.59,
                        "offerfrom": "2016-12-03T08:00:00.000Z",
                        "offerto": "2016-12-10T08:00:00.000Z",
                        "discount": "-20%",
                        "isOptimium": false,
                        "article": {
                          "name": "Kaffee",
                          "brand": "Dallmayr"
                        }
                      }
                    ]
                  }
                ]);
            res.body.should.have.property('optimisationResult');
            res.body.optimisationResult.should.deep.equal(
              {"savings": 7.09,
              "distance": 0,
              "markets": [
                {
                  "id": 13395,
                  "name": "Rewe-Markt GmbH",
                  "latitude": 48.54623,
                  "longitude": 12.1799,
                  "street": "Ritter-von-Schoch-Straße 19",
                  "zip": "84036",
                  "city": "Landshut",
                  "shop": "REWE"
                },
                {
                  "id": 16119,
                  "name": "Baecker R. oHG Muenchen/Ramersdorf-Perla",
                  "latitude": 48.12059,
                  "longitude": 11.6125,
                  "street": "Melusinenstr. 2",
                  "zip": "81671",
                  "city": "München",
                  "shop": "EDEKA"
                }
              ]}
            );

            done();
          });
    });
  });
   
  describe('/PUT update item without offer', () => {
    it('it should update an item', (done) => {
      var item = {
          name: "newitem1Updated",
          amount: 10.00,
          unit: 'stk'
      }
      chai.request(app)
          .put('/api/lists/'+listid+'/optimised/'+itemid1)
          .set('x-access-token', token)
          .send(item)
          .end((err, res) => {
              res.should.have.status(200);
            done();
          });
    });
  });

  describe('/PUT update item with offer', () => {
    it('it should update an item', (done) => {
      var item = {
          name: "newitem1Updated",
          amount: 10.00,
          unit: 'stk',
          offerUser: 812365
      }
      chai.request(app)
          .put('/api/lists/'+listid+'/optimised/'+itemid5)
          .set('x-access-token', token)
          .send(item)
          .end((err, res) => {
              res.should.have.status(200);
            done();
          });
    });
  });

  describe('/PUT save optimisation', () => {
    it('it should update an item', (done) => {
      chai.request(app)
          .post('/api/lists/'+listid)
          .set('x-access-token', token)
          .send()
          .end((err, res) => {
              res.should.have.status(200);
            done();
          });
    });
  });
});