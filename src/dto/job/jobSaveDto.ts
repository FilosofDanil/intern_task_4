export class JobSaveDto {
  name?:string;
  employeeId?:number;
  dateFrom?:Date;
  dateTo?:Date;


  constructor(data: Partial<JobSaveDto>){
    this.name = data.name;
    this.employeeId = data.employeeId;
    this.dateFrom = data.dateFrom || new Date();
    this.dateTo = data.dateTo || new Date();
  }
}

