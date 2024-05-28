import mongoose from "mongoose";
import Job from "../../model/job";
import {JobSaveDto} from "../../dto/job/jobSaveDto";
import axios from "axios";
import {isBefore} from 'date-fns';
import {JobQueryDto} from "../../dto/job/jobQueryDto";
import {JobDto} from "../../dto/job/jobDto";
import {JobCountDto} from "../../dto/job/jobCountDto";

export const createJob = async (
  jobSaveDto: JobSaveDto
): Promise<string> => {
  await validateJob(jobSaveDto);
  const job = await new Job(jobSaveDto).save();
  return job._id;
};

export const getJobsByEmployeeId = async (query: JobQueryDto):
  Promise<JobDto[]> => {
  const employeeIdStr = query.employeeId;
  if (!employeeIdStr) throw new Error("Employee id is required");
  const employeeId = parseInt(employeeIdStr);
  if (isNaN(employeeId)) throw new Error("Employee id must be a number");
  await validateEmployee(employeeId);
  return Job.find({'employeeId': employeeId})
    .sort({createdAt: -1})
    .skip(query.from)
    .limit(query.size)
    .exec();
};

export const getJobCountByEmployeeId = async (jobCountDto: JobCountDto):
  Promise<Record<string, number>> => {
  const employeeIds = jobCountDto.employeeIds;
  if (!employeeIds) throw new Error("Employee ids array is required");
  const counts = await Promise.all(
    employeeIds.map(async (id) => {
      const count = await Job.count({employeeId: id});
      return {id, count};
    })
  );
  return counts.reduce((acc: Record<string, number>, curr: any) => {
    acc[curr.id] = curr.count;
    return acc;
  }, {});
};

export const employeeExists = async (employeeId: number):
  Promise<boolean> => {
  try {
    const response = await axios.get(`http://localhost:8080/api/employee/${employeeId}`);
    return response.status === 200;
  } catch (error: any) {
    if (error.response && error.response.status === 404) {
      return false;
    } else {
      throw new Error(`Error checking existence of employee with ID ${employeeId}: ${error.message}`);
    }
  }
};

export const validateJob = async (jobSaveDto: JobSaveDto) => {
  const id = jobSaveDto.employeeId;
  const name = jobSaveDto.name;
  const dateFrom = jobSaveDto.dateFrom;
  const dateTo = jobSaveDto.dateTo;
  if (id) {
    await validateEmployee(id);
  }

  if (!name || name.length < 3) {
    throw new Error('Job name must have at least 3 characters');
  }
  if (dateFrom && dateTo) {
    if (!isBefore(dateFrom, dateTo)) {
      throw new Error('Invalid date. DateTo from should be after dateFrom ');
    }
  }
};

export const validateEmployee = async (id: number) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error(`Employee with id ${id} doesn't exist`);
  }
  const employeeExisting = await employeeExists(id) as boolean;
  if (!employeeExisting) {
    throw new Error(`Employee with id ${id} doesn't exist`);
  }
};
