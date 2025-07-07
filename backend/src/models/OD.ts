import { Schema, model, Document } from 'mongoose';
import type { IUser } from './User';
import type { IInternship } from './Internship';

export interface IOD extends Document {
  student: IUser['_id'];
  internship: IInternship['_id'];
  startDate: Date;
  endDate: Date;
  purpose: string;
  approved: boolean;
}

const odSchema = new Schema<IOD>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    internship: {
      type: Schema.Types.ObjectId,
      ref: 'Internship',
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    purpose: {
      type: String,
      required: true,
    },
    approved: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default model<IOD>('OD', odSchema); 