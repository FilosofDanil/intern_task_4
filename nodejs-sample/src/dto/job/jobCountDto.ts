export class JobCountDto {
  employeeIds?: number[];

  constructor(data: Partial<JobCountDto>) {
    this.employeeIds = data.employeeIds;
  }
}

