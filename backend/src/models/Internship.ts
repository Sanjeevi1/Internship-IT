import { Schema, model, Document } from 'mongoose';
import type { IUser } from './User';

export interface IInternship extends Document {
  student: IUser['_id'];
  organisationName: string;
  organisationAddressWebsite: string;
  natureOfWork: string;
  reportingAuthority: {
    name: string;
    designation: string;
    email: string;
    mobile: string;
  };
  startDate: Date;
  completionDate: Date;
  modeOfInternship: 'Virtual' | 'Physical';
  stipend: 'Yes' | 'No';
  stipendAmount?: number;
  remarks?: string;
  offerLetter?: string;
  completionCertificate?: string;
  status: 'pending' | 'approved' | 'rejected';
}

const internshipSchema = new Schema<IInternship>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    organisationName: {
      type: String,
      required: true,
    },
    organisationAddressWebsite: {
      type: String,
      required: true,
    },
    natureOfWork: {
      type: String,
      required: true,
    },
    reportingAuthority: {
      name: {
        type: String,
        required: true,
      },
      designation: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
      mobile: {
        type: String,
        required: true,
      },
    },
    startDate: {
      type: Date,
      required: true,
    },
    completionDate: {
      type: Date,
      required: true,
    },
    modeOfInternship: {
      type: String,
      enum: ['Virtual', 'Physical'],
      required: true,
    },
    stipend: {
      type: String,
      enum: ['Yes', 'No'],
      required: true,
    },
    stipendAmount: {
      type: Number,
      required: function (this: IInternship) {
        return this.stipend === 'Yes';
      },
    },
    remarks: String,
    offerLetter: String,
    completionCertificate: String,
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

export default model<IInternship>('Internship', internshipSchema); 