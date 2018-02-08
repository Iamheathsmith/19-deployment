'use strict';

const faker = require('faker');
const mocks = require('../../lib/mocks');
const superagent = require('superagent');
const server = require('../../../lib/server');
const image = `${__dirname}/../../lib/test.jpg`;
require('jest');

describe('POST /api/v1/photo', function() {
  beforeAll(server.start);
  beforeAll(() => mocks.user.createOne().then(data => this.mockUser = data));
  afterAll(server.stop);
  afterAll(mocks.user.removeAll);
  afterAll(mocks.gallery.removeAll);
  beforeAll(() => {
    // let galleryMock = null;
    return mocks.gallery.createOne()
      .then(mock => {
        this.Mock = mock;
        return superagent.post(`:${process.env.PORT}/api/v1/photo`)
          .set('Authorization', `Bearer ${mock.token}`)
          .field('name', faker.lorem.word())
          .field('desc', faker.lorem.words(4))
          .field('galleryId', `${this.Mock.gallery._id}`)
          .attach('image', image);
      })
      .then(res => this.test = res);
  });

  // console.log(this.test.body._id);
  describe('Valid request', () => {
    it('should return a 200 code if GET ME is complete', () => {
      return superagent.get(`:${process.env.PORT}/api/v1/photos/me`)
        .set('Authorization', `Bearer ${this.mockUser.token}`)
        .then(response => {
          expect(response.status).toEqual(200);
        });
    });
    it('should return a 200 code if GET completed', () => {
      return superagent.get(`:${process.env.PORT}/api/v1/photo/${this.test.body._id}`)
        .set('Authorization', `Bearer ${this.mockUser.token}`)
        .then(response => {
          expect(response.status).toEqual(200);
          expect(response.body).toHaveProperty('name');
          expect(response.body).toHaveProperty('desc');
        });
    });
    it('should return a 200 code if POST completed', () => {
      return superagent.get(`:${process.env.PORT}/api/v1/photo`)
        .set('Authorization', `Bearer ${this.mockUser.token}`)
        .then(res => {
          expect(res.status).toEqual(200);
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('Invalid request', () => {
    it('should return a 401 NOT AUTHORIZED given back token', () => {
      return superagent.get(`:${process.env.PORT}/api/v1/photo`)
        .set('Authorization', 'Bearer BADTOKEN')
        .catch(err => expect(err.status).toEqual(401));
    });
    it('should return a 404 BAD REQUEST on a bad path/ID', () => {
      return superagent.get(`:${process.env.PORT}/api/v1/photo/sdfhshfshf`)
        .set('Authorization', `Bearer ${this.mockUser.token}`)
        .catch(err => expect(err.status).toEqual(404));
    });
  });
});