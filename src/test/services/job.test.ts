import chai from 'chai';
import sinon from 'sinon';
import mongoSetup from '../mongoSetup';
import * as jobService from '../../services/job';
import Job from "../../model/job";
import {JobQueryDto} from "../../dto/job/jobQueryDto";
import {JobSaveDto} from "../../dto/job/jobSaveDto";
import {JobCountDto} from "../../dto/job/jobCountDto";

const { expect } = chai;

const sandbox = sinon.createSandbox();

const query1 = new JobQueryDto({ employeeId: '1'});

const job1 = new Job({
  name: "Job1",
  employeeId: 1,
  dateFrom: "2022-11-02T00:00:00.000Z",
  dateTo: "2023-11-03T00:00:00.000Z",
});

const job2 = new Job({
  name: "Job2",
  employeeId: 1,
  dateFrom: "2022-11-02T00:00:00.000Z",
  dateTo: "2023-11-03T00:00:00.000Z",
});

const jobForSearch = new Job({
  name: "Job3",
  employeeId: 2,
  dateFrom: "2022-11-02T00:00:00.000Z",
  dateTo: "2023-11-03T00:00:00.000Z",
});

describe('Student Service', () => {
  before(async () => {
    /**
     * The mongoSetup promise is resolved when the database is ready to be used.
     * After it is resolved we can save all the needed data.
     */
    await mongoSetup;
    await job1.save();
    await job2.save();
    await jobForSearch.save();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('getJobsByEmployeeId should return list of jobs if found', (done) => {
    const validateEmployeeStub = sandbox.stub(jobService, 'validateEmployee');
    jobService.getJobsByEmployeeId(query1)
      .then((jobs) => {
        expect(jobs[0]).to.have.property('name', job2.name);
        expect(jobs[0]).to.have.property('employeeId', job2.employeeId);
        expect(jobs[0]).to.have.property('dateFrom').that.eql(job2.dateFrom);
        expect(jobs[0]).to.have.property('dateTo').that.eql(job2.dateTo);
        expect(validateEmployeeStub.called).to.be.true;
        done();
      })
      .catch((error: Error) => done(error));
  });

  it('getJobsByEmployeeId should throw error if employee not found', (done) => {
    const getJobsStub = sandbox.stub(jobService, 'getJobsByEmployeeId')
      .rejects(new Error(`Employee with id 1 doesn't exist`));
    jobService.getJobsByEmployeeId(query1)
      .then(() => done(new Error('Expected method to reject.')))
      .catch((error: Error) => {
        expect(error.message).to.include(`Employee with id 1 doesn't exist`);
        expect(getJobsStub.calledOnce).to.be.true;
        done();
      });
  });

  it('createJob should create a new job and return its id', (done) => {
    const validateEmployeeStub = sandbox.stub(jobService, 'validateEmployee');
    const jobSaveDto: JobSaveDto = {
      name: 'John',
      employeeId: 2,
      dateFrom: new Date("2022-11-02T00:00:00.000Z"),
      dateTo: new Date("2023-11-03T00:00:00.000Z"),
    };
    jobService.createJob(jobSaveDto)
      .then(async (id) => {
        const job = await Job.findById(id);
        expect(job).to.exist;
        expect(job?.name).to.equal(jobSaveDto.name);
        expect(job?.dateFrom).to.eql(jobSaveDto.dateFrom);
        expect(job?.dateTo).to.eql(jobSaveDto.dateTo);
        expect(job?.employeeId).to.eql(jobSaveDto.employeeId);
        expect(validateEmployeeStub.called).to.be.true;
        done();
      })
      .catch((error: Error) => done(error));
  });

  it('createJob should throw error if employee not found', (done) => {
    const validateEmployeeStub = sandbox.stub(jobService, 'employeeExists')
      .returns(Promise.resolve(false));
    const jobSaveDto: JobSaveDto = {
      name: 'John',
      employeeId: 3,
      dateFrom: new Date("2022-11-02T00:00:00.000Z"),
      dateTo: new Date("2023-11-03T00:00:00.000Z"),
    };
    jobService.createJob(jobSaveDto)
      .then(() => done(new Error('Expected method to reject.')))
      .catch((error: Error) => {
        expect(error.message).to.include(`Employee with id 3 doesn't exist`);
        expect(validateEmployeeStub.called).to.be.true;
        done();
      });
  });

  it('createJob should throw error if name is too short', (done) => {
    const validateEmployeeStub = sandbox.stub(jobService, 'validateEmployee');
    const jobSaveDto: JobSaveDto = {
      name: 'xx',
      employeeId: 3,
      dateFrom: new Date("2022-11-02T00:00:00.000Z"),
      dateTo: new Date("2023-11-03T00:00:00.000Z"),
    };
    jobService.createJob(jobSaveDto)
      .then(() => done(new Error('Expected method to reject.')))
      .catch((error: Error) => {
        console.log(error.message);
        expect(error.message).to.include(`Job name must have at least 3 characters`);
        expect(validateEmployeeStub.calledOnce).to.be.true;
        done();
      });
  });

  it('getJobsCountByEmployeeIds should return job counts for given employeeIds', (done) => {
    const jobCountDto: JobCountDto = { employeeIds: [1, 2, 3] };
    jobService.getJobCountByEmployeeId(jobCountDto)
      .then((counts) => {
        expect(counts).to.have.property('1', 2);
        expect(counts).to.have.property('2', 2);
        expect(counts).to.have.property('3', 0);
        done();
      })
      .catch((error: Error) => done(error));
  });
});
