import bodyParser from 'body-parser';
import express from 'express';
import sinon from 'sinon';
import chai from 'chai';
import chaiHttp from 'chai-http';
import routers from '../../routers/jobs';
import {ObjectId} from 'mongodb';
import Job from '../../model/job';
import * as jobService from '../../services/job';
import mongoose from 'mongoose';

const {expect} = chai;

chai.use(chaiHttp);
chai.should();

const sandbox = sinon.createSandbox();

const app = express();

app.use(bodyParser.json({limit: '1mb'}));
app.use('/', routers);

describe('Job controller', () => {
  afterEach(() => {
    sandbox.restore();
  });

  it('should save the job', (done) => {
    const jobIdAfterSave = new ObjectId();
    const job = {
      name: "Sos",
      employeeId: 66,
      dateFrom: "2022-11-02T00:00:00.000Z",
      dateTo: "2023-11-03T00:00:00.000Z",
    };
    const saveOneStub = sandbox.stub(Job.prototype, 'save');
    saveOneStub.resolves({
      ...job,
      _id: jobIdAfterSave,
    });

    const validateEmployeeStub = sandbox.stub(jobService, 'validateEmployee');

    chai.request(app)
      .post('')
      .send(job)
      .end((err, res) => {
        if (err) return done(err);
        res.should.have.status(201);
        expect(res.body.id).to.equal(jobIdAfterSave.toString());
        expect(validateEmployeeStub.calledOnceWith(job.employeeId)).to.be.true;

        done();
      });
  });


  it('should return error while save the job with invalid employeeId', (done) => {
    const validateEmployeeStub = sandbox.stub(jobService, 'employeeExists')
      .returns(Promise.resolve(false));
    const jobIdAfterSave = new ObjectId();
    const job = {
      name: "Sos",
      employeeId: 66,
      dateFrom: "2022-11-02T00:00:00.000Z",
      dateTo: "2023-11-03T00:00:00.000Z",
    };
    const saveOneStub = sandbox.stub(Job.prototype, 'save');
    saveOneStub.resolves({
      ...job,
      _id: jobIdAfterSave,
    });

    chai.request(app)
      .post('')
      .send(job)
      .end((err, res) => {
        if (err) return done(err);
        res.should.have.status(500);
        expect(validateEmployeeStub.calledOnceWith(job.employeeId)).to.be.true;
        done();
      });
  });

  it('should list the jobs', (done) => {
    const jobs = [
      {
        _id: new ObjectId().toString(),
        name: "Job1",
        employeeId: 66,
        dateFrom: "2022-11-02T00:00:00.000Z",
        dateTo: "2023-11-03T00:00:00.000Z",
      },
      {
        _id: new ObjectId().toString(),
        name: "Job2",
        employeeId: 66,
        dateFrom: "2022-11-02T00:00:00.000Z",
        dateTo: "2023-11-03T00:00:00.000Z",
      },
    ];
    const queryStub = sinon.createStubInstance(mongoose.Query);
    queryStub.sort.returnsThis();
    queryStub.skip.returnsThis();
    queryStub.limit.returnsThis();
    queryStub.exec.resolves(jobs);

    sandbox.stub(Job, 'find').returns(queryStub as any);
    const validateEmployeeStub = sandbox.stub(jobService, 'validateEmployee');
    chai.request(app)
      .get('')
      .query('employeeId=' + 66)
      .end((_, res) => {
        res.should.have.status(200);
        expect(res.body).to.deep.equal(jobs);
        expect(validateEmployeeStub.called).to.be.true;
        done();
      });
  },
  );

  it('should return error if given employeeId is not exist', (done) => {
    const validateEmployeeStub = sandbox.stub(jobService, 'employeeExists')
      .returns(Promise.resolve(false));
    chai.request(app)
      .get('')
      .query('employeeId=' + 66)
      .end((_, res) => {
        res.should.have.status(500);
        expect(validateEmployeeStub.called).to.be.true;
        done();
      });
  },
  );

  it('should count the jobs', (done) => {
    const jobCount = {
      employeeIds: [1, 2],
    };

    const expectedValues = { '1': 1, '2': 1 };

    const countStub = sandbox.stub(Job, 'count');
    countStub.resolves(1);
    chai.request(app)
      .post('/_counts')
      .send(jobCount)
      .end((_, res) => {
        res.should.have.status(200);
        expect(res.body).to.deep.equal(expectedValues);
        done();
      });
  },
  );
});

//Error tests

