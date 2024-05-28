import {Request, Response} from "express";
import httpStatus from "http-status";
import {InternalError} from "../../system/internalError";
import log4js from "log4js";

import {
  createJob as createJobApi,
  getJobsByEmployeeId as getJob,
  getJobCountByEmployeeId as getJobCount,
} from "../../services/job";
import {JobSaveDto} from "../../dto/job/jobSaveDto";
import {JobQueryDto} from "../../dto/job/jobQueryDto";
import {JobCountDto} from "../../dto/job/jobCountDto";

export const saveJob = async (req: Request, res: Response) => {
  try {
    const job = new JobSaveDto(req.body);
    const id = await createJobApi({
      ...job,
    });
    res.status(httpStatus.CREATED).send({
      id,
    });
  } catch (err) {
    const { message, status } = new InternalError(err);
    log4js.getLogger().error('Error in creating job.', err);
    res.status(status).send({ message });
  }
};

export const getJobsByEmployeeId = async (req: Request, res: Response) => {
  try {
    const query = new JobQueryDto(req.query);
    const result = await getJob(query);
    res.send(result);
  } catch (err) {
    const { message, status } = new InternalError(err);
    log4js.getLogger().error('Error in retrieving jobs.', err);
    res.status(status).send({ message });
  }
};

export const getJobCountByEmployeeId = async (req: Request, res: Response) => {
  try {
    const jobCount = new JobCountDto(req.body);
    const counts = await getJobCount(jobCount);
    res.status(httpStatus.OK).send(counts);
  } catch (err) {
    const { message, status } = new InternalError(err);
    log4js.getLogger().error('Error in retrieving jobs.', err);
    res.status(status).send({ message });
  }
};