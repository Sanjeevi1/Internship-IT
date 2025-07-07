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
  IconButton,
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { RootState } from '../../store';
import {
  fetchAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
} from '../../store/slices/announcementSlice';

const validationSchema = Yup.object({
  content: Yup.string().required('Announcement content is required'),
});

export default function Announcements() {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { announcements, loading, error } = useSelector(
    (state: RootState) => state.announcement
  );

  useEffect(() => {
    dispatch(fetchAnnouncements());
  }, [dispatch]);

  const formik = useFormik({
    initialValues: {
      content: '',
    },
    validationSchema,
    onSubmit: (values, { resetForm }) => {
      dispatch(createAnnouncement(values.content)).then(() => {
        resetForm();
      });
    },
  });

  const handleDelete = (id: string) => {
    dispatch(deleteAnnouncement(id));
  };

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
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        Announcements
      </Typography>
      {user?.role === 'faculty' && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              New Announcement
            </Typography>
            <Box component="form" onSubmit={formik.handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="content"
                    name="content"
                    label="Announcement Content"
                    multiline
                    rows={4}
                    value={formik.values.content}
                    onChange={formik.handleChange}
                    error={
                      formik.touched.content && Boolean(formik.errors.content)
                    }
                    helperText={formik.touched.content && formik.errors.content}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button type="submit" variant="contained" disabled={loading}>
                    {loading ? 'Posting...' : 'Post Announcement'}
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </CardContent>
        </Card>
      )}
      <Grid container spacing={3}>
        {announcements.length === 0 ? (
          <Grid item xs={12}>
            <Alert severity="info">No announcements yet.</Alert>
          </Grid>
        ) : (
          announcements.map((announcement) => (
            <Grid item xs={12} key={announcement._id}>
              <Card>
                <CardContent>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                    }}
                  >
                    <Box>
                      <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                        {announcement.content}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        sx={{ mt: 1 }}
                      >
                        Posted by {announcement.faculty.name} on{' '}
                        {new Date(announcement.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                    {user?.role === 'faculty' &&
                      user?._id === announcement.faculty._id && (
                        <IconButton
                          onClick={() => handleDelete(announcement._id)}
                          color="error"
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      )}
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