import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import { AppDispatch, RootState } from '../../store';
import { fetchODs, updateODStatus } from '../../store/slices/odSlice';
import type { OD } from '../../types';

const approvalSteps = [
  { role: 'class_advisor', label: 'Class Advisor' },
  { role: 'mentor', label: 'Mentor' },
  { role: 'hod', label: 'HOD' },
  { role: 'internship_coordinator', label: 'Internship Coordinator' },
];

export default function ODApproval() {
  const dispatch = useDispatch<AppDispatch>();
  const { ods, loading, error } = useSelector((state: RootState) => state.od);
  const { user } = useSelector((state: RootState) => state.auth);
  const [selectedOD, setSelectedOD] = React.useState<OD | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);

  React.useEffect(() => {
    void dispatch(fetchODs());
  }, [dispatch]);

  const getActiveStep = (od: OD) => {
    if (od.currentApprovalStep === 'completed') return 4;
    if (od.currentApprovalStep === 'rejected') return -1;
    return approvalSteps.findIndex(step => step.role === od.currentApprovalStep);
  };

  const canApprove = (od: OD) => {
    if (!user?.facultyRoles) return false;
    return user.facultyRoles.includes(od.currentApprovalStep);
  };

  const handleApprove = async (od: OD) => {
    try {
      await dispatch(updateODStatus({ id: od._id, approved: true })).unwrap();
      setDialogOpen(false);
      setSelectedOD(null);
    } catch (error) {
      console.error('Error approving OD request:', error);
    }
  };

  const handleReject = async (od: OD) => {
    try {
      await dispatch(updateODStatus({ id: od._id, approved: false })).unwrap();
      setDialogOpen(false);
      setSelectedOD(null);
    } catch (error) {
      console.error('Error rejecting OD request:', error);
    }
  };

  const handleViewDetails = (od: OD) => {
    setSelectedOD(od);
    setDialogOpen(true);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  // Filter ODs based on faculty role
  const relevantODs = ods.filter(od => {
    if (!user?.facultyRoles) return false;
    // Show if faculty is part of the approval chain and either:
    // 1. It's their turn to approve (currentApprovalStep matches their role)
    // 2. They've already approved it (check approvalFlow)
    // 3. They're in a later step of the approval chain
    const facultyIndex = approvalSteps.findIndex(step => user.facultyRoles?.includes(step.role));
    const currentIndex = approvalSteps.findIndex(step => step.role === od.currentApprovalStep);
    return facultyIndex >= 0 && (
      od.currentApprovalStep === approvalSteps[facultyIndex].role ||
      od.approvalFlow[approvalSteps[facultyIndex].role]?.approved ||
      currentIndex > facultyIndex
    );
  });

  const pendingODs = relevantODs.filter(od => od.currentApprovalStep !== 'completed' && od.currentApprovalStep !== 'rejected');
  const completedODs = relevantODs.filter(od => od.currentApprovalStep === 'completed' || od.currentApprovalStep === 'rejected');

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        OD Request Management
      </Typography>

      {/* Pending Requests */}
      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
        Pending Requests ({pendingODs.length})
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Student Name</TableCell>
              <TableCell>Register Number</TableCell>
              <TableCell>Organization</TableCell>
              <TableCell>Duration</TableCell>
              <TableCell>Approval Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pendingODs.map((od) => (
              <TableRow key={od._id}>
                <TableCell>{od.student.name}</TableCell>
                <TableCell>{od.student.registerNumber}</TableCell>
                <TableCell>{od.internship.organisationName}</TableCell>
                <TableCell>
                  {new Date(od.startDate).toLocaleDateString()} -{' '}
                  {new Date(od.endDate).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Chip
                    label={od.currentApprovalStep === 'rejected' ? 'Rejected' : 'Pending'}
                    color={od.currentApprovalStep === 'rejected' ? 'error' : 'warning'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Button
                    size="small"
                    onClick={() => handleViewDetails(od)}
                    sx={{ mr: 1 }}
                  >
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Completed Requests */}
      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
        Completed Requests ({completedODs.length})
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Student Name</TableCell>
              <TableCell>Register Number</TableCell>
              <TableCell>Organization</TableCell>
              <TableCell>Duration</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {completedODs.map((od) => (
              <TableRow key={od._id}>
                <TableCell>{od.student.name}</TableCell>
                <TableCell>{od.student.registerNumber}</TableCell>
                <TableCell>{od.internship.organisationName}</TableCell>
                <TableCell>
                  {new Date(od.startDate).toLocaleDateString()} -{' '}
                  {new Date(od.endDate).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Chip
                    label={od.currentApprovalStep === 'completed' ? 'Approved' : 'Rejected'}
                    color={od.currentApprovalStep === 'completed' ? 'success' : 'error'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Button
                    size="small"
                    onClick={() => handleViewDetails(od)}
                  >
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Details Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        {selectedOD && (
          <>
            <DialogTitle>
              OD Request Details
              <Chip
                label={selectedOD.currentApprovalStep === 'completed' ? 'Approved' : 
                      selectedOD.currentApprovalStep === 'rejected' ? 'Rejected' : 'Pending'}
                color={selectedOD.currentApprovalStep === 'completed' ? 'success' : 
                      selectedOD.currentApprovalStep === 'rejected' ? 'error' : 'warning'}
                size="small"
                sx={{ ml: 2 }}
              />
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Approval Progress
                </Typography>
                <Stepper activeStep={getActiveStep(selectedOD)}>
                  {approvalSteps.map((step) => (
                    <Step key={step.role}>
                      <StepLabel>
                        {step.label}
                        {selectedOD.approvalFlow[step.role]?.timestamp && (
                          <Typography variant="caption" display="block">
                            {new Date(selectedOD.approvalFlow[step.role]?.timestamp!).toLocaleDateString()}
                          </Typography>
                        )}
                      </StepLabel>
                    </Step>
                  ))}
                </Stepper>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2">Student Name</Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedOD.student.name}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2">Register Number</Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedOD.student.registerNumber}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Organization</Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedOD.internship.organisationName}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2">Start Date</Typography>
                  <Typography variant="body1" gutterBottom>
                    {new Date(selectedOD.startDate).toLocaleDateString()}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2">End Date</Typography>
                  <Typography variant="body1" gutterBottom>
                    {new Date(selectedOD.endDate).toLocaleDateString()}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Purpose</Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedOD.purpose}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Internship Duration</Typography>
                  <Typography variant="body1" gutterBottom>
                    {new Date(selectedOD.internship.startDate).toLocaleDateString()} -{' '}
                    {new Date(selectedOD.internship.completionDate).toLocaleDateString()}
                  </Typography>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              {canApprove(selectedOD) && (
                <>
                  <Button
                    onClick={() => handleReject(selectedOD)}
                    color="error"
                    variant="outlined"
                  >
                    Reject
                  </Button>
                  <Button
                    onClick={() => handleApprove(selectedOD)}
                    color="primary"
                    variant="contained"
                  >
                    Approve
                  </Button>
                </>
              )}
              <Button onClick={() => setDialogOpen(false)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
} 