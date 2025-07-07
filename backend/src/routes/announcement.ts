import { Router, Request, Response } from 'express';
import { Announcement } from '../models/Announcement';
import { protect, authorize } from '../middleware/auth';

const router = Router();

// @route   GET /api/announcements
// @desc    Get all announcements
// @access  Private
router.get('/', protect, async (req: Request, res: Response) => {
  try {
    const announcements = await Announcement.find()
      .populate('faculty', 'name email department')
      .sort('-createdAt');

    res.json(announcements);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/announcements
// @desc    Create a new announcement
// @access  Private (Faculty)
router.post(
  '/',
  protect,
  authorize('faculty'),
  async (req: Request, res: Response) => {
    try {
      const announcement = await Announcement.create({
        content: req.body.content,
        faculty: req.user._id,
      });

      const populatedAnnouncement = await announcement
        .populate('faculty', 'name email department');

      res.status(201).json(populatedAnnouncement);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
);

// @route   DELETE /api/announcements/:id
// @desc    Delete an announcement
// @access  Private (Faculty)
router.delete(
  '/:id',
  protect,
  authorize('faculty'),
  async (req: Request, res: Response) => {
    try {
      const announcement = await Announcement.findById(req.params.id);

      if (!announcement) {
        return res.status(404).json({ message: 'Announcement not found' });
      }

      // Check if the faculty member is the owner of the announcement
      if (announcement.faculty.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized' });
      }

      await announcement.deleteOne();

      res.json({ message: 'Announcement removed' });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
);

export default router; 