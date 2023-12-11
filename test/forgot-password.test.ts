import chai from 'chai';
import chaiHttp from 'chai-http';
chai.use(chaiHttp);
import { request, expect } from 'chai';
import { describe, it } from 'mocha';
import app from '../../auth-ez-examples/auth-ez-mongo/index';
import { User } from '../../auth-ez-examples/auth-ez-mongo/user.model';
import { CreateMongoAuthController } from '../lib/mongoAuthController';
// import { Config } from '../lib/types'; // Update this path accordingly
import dotenv from 'dotenv';

dotenv.config();
const config = {
  User,
  // Your configuration options here
};

const authController = new CreateMongoAuthController(config);
const authRouter = authController.getRouter();
app.use('/auth', authRouter);

describe('Forgot password test', () => {
  it('should successfully send a forgot-password email and return a 200 status', (done) => {
    request(app)
      .post('/auth/forgot-password')
      .send({
        email: 'usaidpeerzada@gmail.com',
      })
      .end((err, res) => {
        console.log(err);
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('message');
        done();
      });
  });
});
