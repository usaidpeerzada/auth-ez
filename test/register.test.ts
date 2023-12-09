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

describe('Register user API Tests', () => {
  it('should successfully register a user and return a 201 status', (done) => {
    request(app)
      .post('/auth/register')
      .send({
        username: 'tester',
        password: 'test123',
        email: 'test@test.com',
      })
      .end((err, res) => {
        console.log(err);
        expect(res).to.have.status(201);
        expect(res.body).to.have.property('message');
        done();
      });
  });
});
