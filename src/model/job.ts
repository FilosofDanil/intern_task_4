import mongoose, { Document, Schema } from 'mongoose';

export interface IJob extends Document {
  name: string;
  employeeId: number;
  dateFrom: Date;
  dateTo: Date;

  createdAt: Date;
  updatedAt: Date;
}

const jobSchema = new Schema({
  name: {
    required: true,
    type: String,
  },
  employeeId: {
    type: Number,
    required: true,
  },
  dateFrom: {
    type: Date,
  },
  dateTo: {
    type: Date,
  },
}, {
  timestamps: true,
  timezone: 'UTC',
},);

const Job = mongoose.model<IJob>('Job', jobSchema);

export default Job;