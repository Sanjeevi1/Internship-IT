import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUser } from '../models/User';
import UserModel from '../models/User';
import { IInternship } from '../models/Internship';
import InternshipModel from '../models/Internship';
import { IOD } from '../models/OD';
import ODModel from '../models/OD';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://mearn4240:Sanjeevi@cluster0.xtypfm5.mongodb.net/' ;

async function seedData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('📦 Connected to MongoDB');
    
    // Clear existing data
    await UserModel.deleteMany({});
    await InternshipModel.deleteMany({});
    await ODModel.deleteMany({});
    console.log('🧹 Cleared existing data');

    // Create faculty users with different roles
    const facultyUsers = await UserModel.create([
      {
        name: 'Dr. Class Advisor',
        email: 'classadvisor@college.edu',
        password: await bcrypt.hash('password123', 10),
        role: 'faculty',
        department: 'CSE',
        registerNumber: 'FAC001'
      },
      {
        name: 'Dr. Mentor',
        email: 'mentor@college.edu',
        password: await bcrypt.hash('password123', 10),
        role: 'faculty',
        department: 'CSE',
        registerNumber: 'FAC002'
      },
      {
        name: 'Dr. HOD',
        email: 'hod@college.edu',
        password: await bcrypt.hash('password123', 10),
        role: 'faculty',
        department: 'CSE',
        registerNumber: 'FAC003'
      },
      {
        name: 'Dr. Internship Coordinator',
        email: 'coordinator@college.edu',
        password: await bcrypt.hash('password123', 10),
        role: 'faculty',
        department: 'CSE',
        registerNumber: 'FAC004'
      }
    ]);
    console.log('👨‍🏫 Created faculty users');

    // Create 20 students
    const students = await UserModel.create(
      Array.from({ length: 20 }, (_, i: number) => ({
        name: `Student ${i + 1}`,
        email: `student${i + 1}@college.edu`,
        password: bcrypt.hashSync('password123', 10),
        role: 'student',
        department: 'CSE',
        registerNumber: `2021CSE${(i + 1).toString().padStart(3, '0')}`,
      }))
    );
    console.log('👨‍🎓 Created students');

    // Create internships for each student
    const companies = [
      'Google', 'Microsoft', 'Amazon', 'Apple', 'Facebook',
      'Netflix', 'Tesla', 'Intel', 'AMD', 'Nvidia'
    ];

    const natureOfWork = [
      'Software Development', 'Data Science', 'Machine Learning',
      'Web Development', 'Mobile App Development', 'Cloud Computing',
      'DevOps', 'Cybersecurity', 'UI/UX Design', 'Quality Assurance'
    ];

    const internships = await InternshipModel.create(
      students.map((student: IUser, i: number) => ({
        student: student._id,
        organisationName: companies[i % companies.length],
        organisationAddressWebsite: `https://www.${companies[i % companies.length].toLowerCase()}.com`,
        natureOfWork: natureOfWork[i % natureOfWork.length],
        reportingAuthority: {
          name: `Manager ${i + 1}`,
          designation: 'Project Manager',
          email: `manager${i + 1}@${companies[i % companies.length].toLowerCase()}.com`,
          mobile: `+91 9876543${(i + 1).toString().padStart(3, '0')}`
        },
        modeOfInternship: i % 2 === 0 ? 'Virtual' : 'Physical',
        startDate: new Date(2024, i % 12, 1),
        completionDate: new Date(2024, (i % 12) + 2, 1),
        stipend: i % 2 === 0 ? 'Yes' : 'No',
        stipendAmount: i % 2 === 0 ? Math.floor(Math.random() * 30000) + 20000 : undefined,
        status: i % 4 === 0 ? 'approved' : i % 4 === 1 ? 'rejected' : 'pending'
      }))
    );
    console.log('💼 Created internships');

    // Create OD requests
    const odRequests = await ODModel.create(
      internships.map((internship: IInternship, i: number) => ({
        student: internship.student,
        internship: internship._id,
        startDate: new Date(2024, i % 12, 15),
        endDate: new Date(2024, i % 12, 20),
        purpose: `Attending ${['training', 'workshop', 'project work', 'client meeting'][i % 4]} at ${internship.organisationName}`,
        approved: i % 3 === 0
      }))
    );
    console.log('📝 Created OD requests');

    console.log('\n✅ Seed data created successfully!');
    console.log(`Created:
      - ${facultyUsers.length} faculty users
      - ${students.length} students
      - ${internships.length} internships
      - ${odRequests.length} OD requests`);

  } catch (error) {
    console.error('❌ Error seeding data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
}

seedData(); 