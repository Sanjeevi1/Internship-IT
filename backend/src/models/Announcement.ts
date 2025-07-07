import { Schema, model, Document } from 'mongoose';
import type { IUser } from './User';

export interface IAnnouncement extends Document {
  faculty: IUser['_id'];
  content: string;
}

const announcementSchema = new Schema<IAnnouncement>(
  {
    faculty: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Announcement = model<IAnnouncement>('Announcement', announcementSchema);
export default Announcement; 