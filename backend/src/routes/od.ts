import { Router, Request, Response } from 'express';
import OD from '../models/OD';
import Internship from '../models/Internship';
import { protect, authorize } from '../middleware/auth';

const router = Router();

// @route   POST /api/od
// @desc    Create a new OD request
// @access  Private (Student)
router.post(
  '/',
  protect,
  authorize('student'),
  async (req: Request, res: Response) => {
    try {
      const internship = await Internship.findById(req.body.internship);
      
      if (!internship) {
        return res.status(404).json({ message: 'Internship not found' });
      }

      // Check if the internship belongs to the student
      if (internship.student.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized' });
      }

      // Check if the internship is approved
      if (internship.status !== 'approved') {
        return res.status(400).json({ message: 'Internship must be approved before requesting OD' });
      }

      // Validate OD dates are within internship duration
      const startDate = new Date(req.body.startDate);
      const endDate = new Date(req.body.endDate);
      const internshipStartDate = new Date(internship.startDate);
      const internshipEndDate = new Date(internship.completionDate);

      if (startDate < internshipStartDate || endDate > internshipEndDate) {
        return res.status(400).json({ 
          message: 'OD dates must be within the internship duration' 
        });
      }

      const od = await OD.create({
        ...req.body,
        student: req.user._id,
      });

      const populatedOD = await od.populate([
        { path: 'student', select: 'name registerNumber email department' },
        { path: 'internship', select: 'organisationName startDate completionDate' }
      ]);

      res.status(201).json(populatedOD);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
);

// @route   GET /api/od
// @desc    Get all OD requests (faculty) or user's OD requests (student)
// @access  Private
router.get('/', protect, async (req: Request, res: Response) => {
  try {
    const query = req.user.role === 'student' ? { student: req.user._id } : {};
    const ods = await OD.find(query)
      .populate('student', 'name registerNumber email department')
      .populate('internship', 'organisationName startDate completionDate')
      .sort('-createdAt');

    res.json(ods);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/od/:id
// @desc    Get OD request by ID
// @access  Private
router.get('/:id', protect, async (req: Request, res: Response) => {
  try {
    const od = await OD.findById(req.params.id)
      .populate('student', 'name registerNumber email department')
      .populate('internship', 'organisationName startDate completionDate');

    if (!od) {
      return res.status(404).json({ message: 'OD request not found' });
    }

    // Check if user has permission to view this OD request
    if (
      req.user.role === 'student' &&
      od.student.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(od);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/od/:id
// @desc    Update OD request status
// @access  Private (Faculty)
router.put(
  '/:id',
  protect,
  authorize('faculty'),
  async (req: Request, res: Response) => {
    try {
      const { approved } = req.body;

      const od = await OD.findById(req.params.id)
        .populate('student', 'name registerNumber email department')
        .populate('internship', 'organisationName startDate completionDate');

      if (!od) {
        return res.status(404).json({ message: 'OD request not found' });
      }

      od.approved = approved;
      await od.save();

      res.json(od);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
);

export default router; 