
# LAB 18: Image Uploads w/ AWS S3


### Installing and How to use.

To install this program, place fork and 'git clone' this repo to your computer. From the terminal, navigate to  `lab-heath`. once there, install NPM but typing in , `nmp install` and httpie(done with home) after that you need to install cors, express, body-parser, dotenv, faker,jsonwebtoken, mongoose, bcrypt `npm i`. for devolper Dependencies are superagent jest eslint do these with `npm i -D` you also need to have HTTPIE installed via homebrew `brew install httpie` in the terminal. this will let you do the helpful commands inside of the terminal.



next you need to have these scripts adjusted in your package.json file.

```javascript
 "scripts": {
    "start": "node index.js",
    "start:watch": "nodemon index.js",
    "start:debug": "DEBUG=http* nodemon index.js",
    "test": "jest -i",
    "test:watch": "jest -i --watchAll",
    "test:debug": "DEBUG=http* jest -i",
    "lint": "eslint .",
    "lint:test": "npm run lint && npm test",
    "start-db": "mkdir -p ./data/db && mongod --dbpath ./data/db",
    "stop-db": "killall mongod"
  },
  ```

from there, you can go to your terminal and type, 

```javascript
node run start
```
and this will start up your server, if you do `npn run start:watch`, this will let you see it in your localhost in your browser.

you will also need to start up your mongoDB also with the code below on a diffferent termail

```javascript
node run start-db
```

### some helpful commands  

these are you basic commands 

to sign up to the database
```javascript
http POST :3000/api/v1/signup username=tim email='tim@blah.com' password=stuff
```

this should return this 

```javascript
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbiI6IjVmNGRjYzVlNjBlMTM2OWQ2ZGQ3NzQ5MmM3MDI5ZWQ3MmE3M2NkODlkNzBmZDVkNzdmOGEzOTU1MTAwMzE2YjMiLCJpYXQiOjE1MTc4ODE2MTN9.k3qz85cMxjTzAFsNFFptNkOwhQYW5eGWLZm-XGl6J_Q"

```

you can also sign in with this command
```javascript
http POST :3000/api/v1/gallery name=stuff description='place for images' 'Authorization:Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbiI6ImMzZjE2OGJjZWE3MTdhZDA0NzEzMmM2YTY2NjkzYjc5ZjllMTg5YzM0MTE4ZDE1YmU5YzBhZWYwZmIxODhkM2UiLCJpYXQiOjE1MTgwNDQ3Njh9.bSOXZI5JLnwI97TphivmKsWcIRGcWbm8KibSrzhdhwU'
```

then do write this 
```javascript
http -f POST :3000/api/v1/photo image@~/Downloads/test.jpg name='some image' desc='test image for us' galleryId='5a7b8690d1da780da778867a' 'Authorization:Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbiI6ImMzZjE2OGJjZWE3MTdhZDA0NzEzMmM2YTY2NjkzYjc5ZjllMTg5YzM0MTE4ZDE1YmU5YzBhZWYwZmIxODhkM2UiLCJpYXQiOjE1MTgwNDQ3Njh9.bSOXZI5JLnwI97TphivmKsWcIRGcWbm8KibSrzhdhwU'
```

this has now built a user, added a gallery and then added an image to that gallery. if you want to get it, type in this

```javascript
http -f GET :3000/api/v1/photo/5a7b886411bfcd0ee1ba1afb 'Authorization:Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbiI6ImMzZjE2OGJjZWE3MTdhZDA0NzEzMmM2YTY2NjkzYjc5ZjllMTg5YzM0MTE4ZDE1YmU5YzBhZWYwZmIxODhkM2UiLCJpYXQiOjE1MTgwNDQ3Njh9.bSOXZI5JLnwI97TphivmKsWcIRGcWbm8KibSrzhdhwU'
```

### Testing

we are doing testing for the photos today and here is what they look like.



#### test for POST vaild

test 1: we are seeing if the image was sent to the gallery and then see if the status code is 201, the body to have name and desc attached to it. and the userId and the galleryID to match.

```javascript
  it('should return a 201 code if POST completed', () => {
      let galleryMock = null;
      return mocks.gallery.createOne()
        .then(mock => {
          galleryMock = mock;
          return superagent.post(`:${process.env.PORT}/api/v1/photo`)
            .set('Authorization', `Bearer ${mock.token}`)
            .field('name', faker.lorem.word())
            .field('desc', faker.lorem.words(4))
            .field('galleryId', `${galleryMock.gallery._id}`)
            .attach('image', image);
        })
        .then(response => {
          expect(response.status).toEqual(201);
          expect(response.body).toHaveProperty('name');
          expect(response.body).toHaveProperty('desc');
          expect(response.body.userId).toEqual(galleryMock.gallery.userId.toString());
        });
    });
  ```

#### test for POST invaild

test 2: making sure we send a 401 status code if not auth.
test 2: making sure we send a 400 status code if the data is bad.

```javascript
  it('should return a 401 NOT AUTHORIZED given back token', () => {
      return superagent.post(`:${process.env.PORT}/api/v1/photo`)
        .set('Authorization', 'Bearer BADTOKEN')
        .catch(err => expect(err.status).toEqual(401));
    });
    it('should return a 400 BAD REQUEST on improperly formatted body', () => {
      return superagent.post(`:${process.env.PORT}/api/v1/photo`)
        .set('Authorization', `Bearer ${this.mockUser.token}`)
        .field('name', faker.lorem.word())
        .field('desc', faker.lorem.words(4))
        .attach('image', image)
        .catch(err => expect(err.status).toEqual(400));
    });
```

#### test for GET vaild


test 1: we should get a 200 if it worked and we check to see if the res has a name and desc.
test 2: check to see if the res.body is an array.

```javascript
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
  ```

#### test for GET invaild

  test 3: you should get a 401 if you are not allowed to do such a thing.
  test 4: you should get a 404 if you use a bag ID.


  ```javascript
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
  ```
