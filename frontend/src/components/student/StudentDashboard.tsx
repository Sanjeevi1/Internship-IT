import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { RootState } from '../../store';
import { fetchMyInternships } from '../../store/slices/internshipSlice';

export default function StudentDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { internships, loading, error } = useSelector(
    (state: RootState) => state.internship
  );

  useEffect(() => {
    dispatch(fetchMyInternships());
  }, [dispatch]);

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

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h4" component="h1">
          My Internships
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/internship/new')}
        >
          New Internship
        </Button>
      </Box>
      <Grid container spacing={3}>
        {internships.length === 0 ? (
          <Grid item xs={12}>
            <Alert severity="info">
              You haven't added any internships yet. Click the "New Internship"
              button to get started.
            </Alert>
          </Grid>
        ) : (
          internships.map((internship) => (
            <Grid item xs={12} md={6} lg={4} key={internship._id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {internship.organisationName}
                  </Typography>
                  <Typography color="textSecondary" gutterBottom>
                    {internship.natureOfWork}
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2">
                      <strong>Mode:</strong> {internship.modeOfInternship}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Duration:</strong>{' '}
                      {new Date(internship.startDate).toLocaleDateString()} -{' '}
                      {new Date(internship.completionDate).toLocaleDateString()}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Stipend:</strong>{' '}
                      {internship.stipend === 'Yes'
                        ? `₹${internship.stipendAmount}/month`
                        : 'No'}
                    </Typography>
                  </Box>
                  <Box sx={{ mt: 2 }}>
                    <Chip
                      label={internship.status}
                      color={
                        internship.status === 'approved'
                          ? 'success'
                          : internship.status === 'rejected'
                          ? 'error'
                          : 'warning'
                      }
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