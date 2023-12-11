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

describe('Reset password test', () => {
  it('should successfully change password with authenticated link email and return a 200 status', (done) => {
    request(app)
      .post(
        '/auth/reset-password?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NTc0YTY5OTNlY2YxMmQwYTAxODYyZWEiLCJpYXQiOjE3MDIyMTc2NzMsImV4cCI6MTcwMjIyMTI3M30.YkllUZ7ZOgCGoftTV0NQ8ijUNB2YBrD9jXurx-LfhVQ',
      )
      .send({
        newPassword: 'test123',
      })
      .end((err, res) => {
        console.log(err);
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('message');
        done();
      });
  });
});
