import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Internship from '../models/Internship';
import { protect, authorize } from '../middleware/auth';

const router = Router();

// Ensure uploads directory exists
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only PDF, DOC, and DOCX files are allowed!'));
  },
});

// @route   POST /api/internships
// @desc    Create a new internship
// @access  Private (Student)
router.post(
  '/',
  protect,
  authorize('student'),
  upload.single('offerLetter'),
  async (req: Request, res: Response) => {
    try {
      // Log the entire request for debugging
      console.log('Headers:', req.headers);
      console.log('Body:', req.body);
      console.log('File:', req.file);
      console.log('User:', req.user);

      // Parse reporting authority if it's a string
      let reportingAuthority = req.body.reportingAuthority;
      if (typeof reportingAuthority === 'string') {
        try {
          reportingAuthority = JSON.parse(reportingAuthority);
        } catch (e) {
          console.error('Error parsing reporting authority:', e);
          throw new Error('Invalid reporting authority format');
        }
      }

      // Parse dates
      const startDate = new Date(req.body.startDate);
      const completionDate = new Date(req.body.completionDate);

      if (isNaN(startDate.getTime())) throw new Error('Invalid start date');
      if (isNaN(completionDate.getTime())) throw new Error('Invalid completion date');
      if (startDate > completionDate) throw new Error('Start date must be before completion date');

      // Create internship object
      const internshipData = {
        student: req.user._id,
        organisationName: req.body.organisationName,
        organisationAddressWebsite: req.body.organisationAddressWebsite,
        natureOfWork: req.body.natureOfWork,
        reportingAuthority,
        startDate,
        completionDate,
        modeOfInternship: req.body.modeOfInternship,
        stipend: req.body.stipend,
        stipendAmount: req.body.stipend === 'Yes' ? Number(req.body.stipendAmount) : undefined,
        offerLetter: req.file?.path,
      };

      console.log('Creating internship with data:', internshipData);

      const internship = await Internship.create(internshipData);

      console.log('Created internship:', internship);
      res.status(201).json(internship);
    } catch (error: any) {
      console.error('Error creating internship:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });

      // Delete uploaded file if there was an error
      if (req.file?.path) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (e) {
          console.error('Error deleting file:', e);
        }
      }

      res.status(500).json({
        message: error.message,
        type: error.name,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      });
    }
  }
);

// @route   GET /api/internships
// @desc    Get all internships (faculty) or user's internships (student)
// @access  Private
router.get('/', protect, async (req: Request, res: Response) => {
  try {
    const query = req.user.role === 'student' ? { student: req.user._id } : {};
    const internships = await Internship.find(query)
      .populate('student', 'name registerNumber email department')
      .sort('-createdAt');

    res.json(internships);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/internships/:id
// @desc    Get internship by ID
// @access  Private
router.get('/:id', protect, async (req: Request, res: Response) => {
  try {
    const internship = await Internship.findById(req.params.id).populate(
      'student',
      'name registerNumber email department'
    );

    if (!internship) {
      return res.status(404).json({ message: 'Internship not found' });
    }

    // Check if user has permission to view this internship
    if (
      req.user.role === 'student' &&
      internship.student.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(internship);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/internships/:id
// @desc    Update internship status
// @access  Private (Faculty)
router.put(
  '/:id',
  protect,
  authorize('faculty'),
  async (req: Request, res: Response) => {
    try {
      const { status } = req.body;

      const internship = await Internship.findById(req.params.id);

      if (!internship) {
        return res.status(404).json({ message: 'Internship not found' });
      }

      internship.status = status;
      await internship.save();

      res.json(internship);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
);

// @route   PUT /api/internships/:id/certificate
// @desc    Upload completion certificate
// @access  Private (Student)
router.put(
  '/:id/certificate',
  protect,
  authorize('student'),
  upload.single('completionCertificate'),
  async (req: Request, res: Response) => {
    try {
      const internship = await Internship.findById(req.params.id);

      if (!internship) {
        return res.status(404).json({ message: 'Internship not found' });
      }

      if (internship.student.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized' });
      }

      internship.completionCertificate = req.file?.path;
      await internship.save();

      res.json(internship);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
);

export default router; 