import chai from 'chai';
import chaiHttp from 'chai-http';
chai.use(chaiHttp);
import { request, expect } from 'chai';
import { describe, it } from 'mocha';
import app from '../../auth-ez-examples/auth-ez-mongo/index';
import { User } from '../../auth-ez-examples/auth-ez-mongo/user.model';
import { CreateMongoAuthController } from '../lib/mongoAuthController';
// import { Config } from '../lib/types'; // Update this path accordingly

const config = {
  User,
  // Your configuration options here
};

const authController = new CreateMongoAuthController(config);
const authRouter = authController.getRouter();
app.use('/auth', authRouter);

describe('Login API Tests', () => {
  // Test for login with email
  it('should successfully login with email and return a token', (done) => {
    request(app)
      .post('/auth/login-with-email')
      .send({ email: 'usaidpeerzada@gmail.com', password: 'toin' })
      .end((err, res) => {
        console.log(err);
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('token');
        done();
      });
  });

  // Test for login with username
  it('should successfully login with username and return a token', (done) => {
    request(app)
      .post('/auth/login-with-username')
      .send({ username: 'email', password: 'toin' })
      .end((err, res) => {
        console.log(err);
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('token');
        done();
      });
  });
});
