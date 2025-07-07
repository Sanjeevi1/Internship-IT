import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Chip,
  MenuItem,
} from '@mui/material';
import { AppDispatch, RootState } from '../../store';
import { createOD, fetchODs } from '../../store/slices/odSlice';
import { fetchInternships } from '../../store/slices/internshipSlice';
import type { OD } from '../../types';

const validationSchema = Yup.object({
  internship: Yup.string().required('Internship is required'),
  startDate: Yup.date()
    .required('Start date is required')
    .min(new Date(), 'Start date must be in the future'),
  endDate: Yup.date()
    .min(Yup.ref('startDate'), 'End date must be after start date')
    .required('End date is required'),
  purpose: Yup.string()
    .required('Purpose is required')
    .min(10, 'Purpose must be at least 10 characters'),
});

export default function ODRequests() {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { ods, loading, error } = useSelector((state: RootState) => state.od);
  const { internships } = useSelector((state: RootState) => state.internship);

  useEffect(() => {
    void dispatch(fetchODs());
    if (user?.role === 'student') {
      void dispatch(fetchInternships());
    }
  }, [dispatch, user?.role]);

  // Get today's date and tomorrow's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const formik = useFormik({
    initialValues: {
      internship: '',
      startDate: today,
      endDate: tomorrowStr,
      purpose: 'Attending technical training session at the organization',
    },
    validationSchema,
    onSubmit: async (values, { resetForm, setStatus }) => {
      try {
        // Validate dates against selected internship
        const selectedInternship = internships.find(i => i._id === values.internship);
        if (selectedInternship) {
          const startDate = new Date(values.startDate);
          const endDate = new Date(values.endDate);
          const internshipStart = new Date(selectedInternship.startDate);
          const internshipEnd = new Date(selectedInternship.completionDate);

          if (startDate < internshipStart || endDate > internshipEnd) {
            setStatus('OD dates must be within the internship duration');
            return;
          }
        }

        await dispatch(createOD(values)).unwrap();
        resetForm();
      } catch (error: any) {
        console.error('Error creating OD request:', error);
        setStatus(error.message || 'Failed to create OD request');
      }
    },
  });

  // Set initial internship if there's only one approved internship
  useEffect(() => {
    const approvedInternships = internships.filter(
      (internship) => internship.status === 'approved'
    );
    if (approvedInternships.length === 1 && !formik.values.internship) {
      formik.setFieldValue('internship', approvedInternships[0]._id);
    }
  }, [internships]);

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  const approvedInternships = internships.filter(
    (internship) => internship.status === 'approved'
  );

  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        {user?.role === 'student' ? 'Request OD' : 'OD Requests'}
      </Typography>
      {user?.role === 'student' && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              New OD Request
            </Typography>
            {formik.status && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {formik.status}
              </Alert>
            )}
            {approvedInternships.length === 0 ? (
              <Alert severity="info" sx={{ mb: 2 }}>
                You need an approved internship to request OD.
              </Alert>
            ) : (
              <Box component="form" onSubmit={formik.handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      id="internship"
                      name="internship"
                      label="Select Internship"
                      select
                      value={formik.values.internship}
                      onChange={(e) => {
                        formik.setFieldValue('internship', e.target.value);
                        // Reset dates when internship changes
                        formik.setFieldValue('startDate', today);
                        formik.setFieldValue('endDate', tomorrowStr);
                      }}
                      error={
                        formik.touched.internship &&
                        Boolean(formik.errors.internship)
                      }
                      helperText={
                        formik.touched.internship && formik.errors.internship
                      }
                    >
                      {approvedInternships.map((internship) => (
                        <MenuItem key={internship._id} value={internship._id}>
                          {internship.organisationName} ({new Date(internship.startDate).toLocaleDateString()} - {new Date(internship.completionDate).toLocaleDateString()})
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      id="startDate"
                      name="startDate"
                      label="Start Date"
                      type="date"
                      value={formik.values.startDate}
                      onChange={formik.handleChange}
                      error={
                        formik.touched.startDate && Boolean(formik.errors.startDate)
                      }
                      helperText={formik.touched.startDate && formik.errors.startDate}
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      id="endDate"
                      name="endDate"
                      label="End Date"
                      type="date"
                      value={formik.values.endDate}
                      onChange={formik.handleChange}
                      error={formik.touched.endDate && Boolean(formik.errors.endDate)}
                      helperText={formik.touched.endDate && formik.errors.endDate}
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      id="purpose"
                      name="purpose"
                      label="Purpose"
                      multiline
                      rows={4}
                      value={formik.values.purpose}
                      onChange={formik.handleChange}
                      error={formik.touched.purpose && Boolean(formik.errors.purpose)}
                      helperText={formik.touched.purpose && formik.errors.purpose}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button type="submit" variant="contained" disabled={loading}>
                      {loading ? 'Submitting...' : 'Submit'}
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            )}
          </CardContent>
        </Card>
      )}
      <Grid container spacing={3}>
        {ods.length === 0 ? (
          <Grid item xs={12}>
            <Alert severity="info">
              {user?.role === 'student'
                ? "You haven't made any OD requests yet."
                : 'No OD requests to review.'}
            </Alert>
          </Grid>
        ) : (
          ods.map((od: OD) => (
            <Grid item xs={12} md={6} lg={4} key={od._id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {od.student.name}
                  </Typography>
                  <Typography color="textSecondary" gutterBottom>
                    {od.student.registerNumber}
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2">
                      <strong>Organization:</strong> {od.internship?.organisationName}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Duration:</strong>{' '}
                      {new Date(od.startDate).toLocaleDateString()} -{' '}
                      {new Date(od.endDate).toLocaleDateString()}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Purpose:</strong> {od.purpose}
                    </Typography>
                  </Box>
                  <Box sx={{ mt: 2 }}>
                    <Chip
                      label={od.approved ? 'Approved' : 'Pending'}
                      color={od.approved ? 'success' : 'warning'}
                      size="small"
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>
    </Box>
  );
} 