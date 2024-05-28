import {QueryDto} from "../queryDto";

export class JobQueryDto extends QueryDto {

  employeeId?: string;

  constructor(query?: Partial<JobQueryDto>) {
    super();
    if (query) {
      this.employeeId = query.employeeId;
      this.from = query.from || 0;
      this.size = query.size || 10;
    }
  }
}