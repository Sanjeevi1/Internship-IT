import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from '@mui/material';
import { AppDispatch, RootState } from '../../store';
import { createInternship } from '../../store/slices/internshipSlice';
import React from 'react';

const validationSchema = Yup.object({
  organisationName: Yup.string().required('Organization name is required'),
  organisationAddressWebsite: Yup.string().required(
    'Organization address/website is required'
  ),
  natureOfWork: Yup.string().required('Nature of work is required'),
  reportingAuthority: Yup.object({
    name: Yup.string().required('Reporting authority name is required'),
    designation: Yup.string().required(
      'Reporting authority designation is required'
    ),
    email: Yup.string()
      .email('Invalid email address')
      .required('Reporting authority email is required'),
    mobile: Yup.string()
      .matches(/^[0-9]{10}$/, 'Invalid mobile number')
      .required('Reporting authority mobile is required'),
  }),
  startDate: Yup.date().required('Start date is required'),
  completionDate: Yup.date()
    .min(Yup.ref('startDate'), 'Completion date must be after start date')
    .required('Completion date is required'),
  modeOfInternship: Yup.string()
    .oneOf(['Virtual', 'Physical'], 'Invalid mode of internship')
    .required('Mode of internship is required'),
  stipend: Yup.string()
    .oneOf(['Yes', 'No'], 'Invalid stipend option')
    .required('Stipend option is required'),
  stipendAmount: Yup.number().when('stipend', {
    is: 'Yes',
    then: (schema) =>
      schema
        .min(0, 'Stipend amount must be positive')
        .required('Stipend amount is required'),
  }),
  offerLetter: Yup.mixed().required('Offer letter is required'),
});

export default function InternshipForm() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state: RootState) => state.internship);

  // Get today's date and format it as YYYY-MM-DD
  const today = new Date().toISOString().split('T')[0];
  // Get date 3 months from today
  const threeMonthsFromNow = new Date();
  threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
  const futureDate = threeMonthsFromNow.toISOString().split('T')[0];

  const formik = useFormik({
    initialValues: {
      organisationName: 'Tech Solutions Inc.',
      organisationAddressWebsite: 'www.techsolutions.com',
      natureOfWork: 'Software Development Internship - Working on full-stack web applications using React and Node.js',
      reportingAuthority: {
        name: 'John Doe',
        designation: 'Senior Software Engineer',
        email: 'john.doe@techsolutions.com',
        mobile: '9876543210',
      },
      startDate: today,
      completionDate: futureDate,
      modeOfInternship: 'Virtual',
      stipend: 'Yes',
      stipendAmount: '15000',
      offerLetter: null as File | null,
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const formData = new FormData();
        
        // Add basic fields
        formData.append('organisationName', values.organisationName);
        formData.append('organisationAddressWebsite', values.organisationAddressWebsite);
        formData.append('natureOfWork', values.natureOfWork);
        formData.append('startDate', values.startDate);
        formData.append('completionDate', values.completionDate);
        formData.append('modeOfInternship', values.modeOfInternship);
        formData.append('stipend', values.stipend);
        if (values.stipend === 'Yes' && values.stipendAmount) {
          formData.append('stipendAmount', values.stipendAmount.toString());
        }

        // Add reporting authority as JSON string
        formData.append('reportingAuthority', JSON.stringify({
          name: values.reportingAuthority.name,
          designation: values.reportingAuthority.designation,
          email: values.reportingAuthority.email,
          mobile: values.reportingAuthority.mobile,
        }));

        // Add file
        if (values.offerLetter instanceof File) {
          formData.append('offerLetter', values.offerLetter);
        } else {
          throw new Error('Please select an offer letter file');
        }

        // Log the form data for debugging
        console.log('Form values:', {
          ...values,
          offerLetter: values.offerLetter ? {
            name: values.offerLetter.name,
            type: values.offerLetter.type,
            size: values.offerLetter.size
          } : null
        });

        const result = await dispatch(createInternship(formData)).unwrap();
        console.log('Internship created:', result);
        navigate('/');
      } catch (error: any) {
        console.error('Error creating internship:', error);
        formik.setStatus(error.message || 'Failed to create internship');
      }
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    if (file) {
      formik.setFieldValue('offerLetter', file);
    }
  };

  // Create a sample PDF file for testing
  const createSamplePDF = async () => {
    try {
      // Create a simple text blob
      const content = 'This is a sample offer letter for testing purposes.';
      const blob = new Blob([content], { type: 'application/pdf' });
      const file = new File([blob], 'sample-offer-letter.pdf', { type: 'application/pdf' });
      formik.setFieldValue('offerLetter', file);
    } catch (error) {
      console.error('Error creating sample PDF:', error);
    }
  };

  // Auto-create sample PDF when component mounts
  React.useEffect(() => {
    createSamplePDF();
  }, []);

  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        New Internship Application
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      {formik.status && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {formik.status}
        </Alert>
      )}
      <Card>
        <CardContent>
          <Box component="form" onSubmit={formik.handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="organisationName"
                  name="organisationName"
                  label="Organization Name"
                  value={formik.values.organisationName}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.organisationName &&
                    Boolean(formik.errors.organisationName)
                  }
                  helperText={
                    formik.touched.organisationName &&
                    formik.errors.organisationName
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="organisationAddressWebsite"
                  name="organisationAddressWebsite"
                  label="Organization Address/Website"
                  value={formik.values.organisationAddressWebsite}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.organisationAddressWebsite &&
                    Boolean(formik.errors.organisationAddressWebsite)
                  }
                  helperText={
                    formik.touched.organisationAddressWebsite &&
                    formik.errors.organisationAddressWebsite
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="natureOfWork"
                  name="natureOfWork"
                  label="Nature of Work"
                  multiline
                  rows={4}
                  value={formik.values.natureOfWork}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.natureOfWork &&
                    Boolean(formik.errors.natureOfWork)
                  }
                  helperText={
                    formik.touched.natureOfWork && formik.errors.natureOfWork
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Reporting Authority Details
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  id="reportingAuthority.name"
                  name="reportingAuthority.name"
                  label="Name"
                  value={formik.values.reportingAuthority.name}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.reportingAuthority?.name &&
                    Boolean(formik.errors.reportingAuthority?.name)
                  }
                  helperText={
                    formik.touched.reportingAuthority?.name &&
                    formik.errors.reportingAuthority?.name
                  }
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  id="reportingAuthority.designation"
                  name="reportingAuthority.designation"
                  label="Designation"
                  value={formik.values.reportingAuthority.designation}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.reportingAuthority?.designation &&
                    Boolean(formik.errors.reportingAuthority?.designation)
                  }
                  helperText={
                    formik.touched.reportingAuthority?.designation &&
                    formik.errors.reportingAuthority?.designation
                  }
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  id="reportingAuthority.email"
                  name="reportingAuthority.email"
                  label="Email"
                  value={formik.values.reportingAuthority.email}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.reportingAuthority?.email &&
                    Boolean(formik.errors.reportingAuthority?.email)
                  }
                  helperText={
                    formik.touched.reportingAuthority?.email &&
                    formik.errors.reportingAuthority?.email
                  }
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  id="reportingAuthority.mobile"
                  name="reportingAuthority.mobile"
                  label="Mobile"
                  value={formik.values.reportingAuthority.mobile}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.reportingAuthority?.mobile &&
                    Boolean(formik.errors.reportingAuthority?.mobile)
                  }
                  helperText={
                    formik.touched.reportingAuthority?.mobile &&
                    formik.errors.reportingAuthority?.mobile
                  }
                />
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
                    formik.touched.startDate &&
                    Boolean(formik.errors.startDate)
                  }
                  helperText={
                    formik.touched.startDate && formik.errors.startDate
                  }
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  id="completionDate"
                  name="completionDate"
                  label="Completion Date"
                  type="date"
                  value={formik.values.completionDate}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.completionDate &&
                    Boolean(formik.errors.completionDate)
                  }
                  helperText={
                    formik.touched.completionDate &&
                    formik.errors.completionDate
                  }
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel id="modeOfInternship-label">
                    Mode of Internship
                  </InputLabel>
                  <Select
                    labelId="modeOfInternship-label"
                    id="modeOfInternship"
                    name="modeOfInternship"
                    value={formik.values.modeOfInternship}
                    onChange={formik.handleChange}
                    error={
                      formik.touched.modeOfInternship &&
                      Boolean(formik.errors.modeOfInternship)
                    }
                    label="Mode of Internship"
                  >
                    <MenuItem value="Virtual">Virtual</MenuItem>
                    <MenuItem value="Physical">Physical</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel id="stipend-label">Stipend</InputLabel>
                  <Select
                    labelId="stipend-label"
                    id="stipend"
                    name="stipend"
                    value={formik.values.stipend}
                    onChange={formik.handleChange}
                    error={
                      formik.touched.stipend && Boolean(formik.errors.stipend)
                    }
                    label="Stipend"
                  >
                    <MenuItem value="Yes">Yes</MenuItem>
                    <MenuItem value="No">No</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              {formik.values.stipend === 'Yes' && (
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    id="stipendAmount"
                    name="stipendAmount"
                    label="Stipend Amount"
                    type="number"
                    value={formik.values.stipendAmount}
                    onChange={formik.handleChange}
                    error={
                      formik.touched.stipendAmount &&
                      Boolean(formik.errors.stipendAmount)
                    }
                    helperText={
                      formik.touched.stipendAmount &&
                      formik.errors.stipendAmount
                    }
                  />
                </Grid>
              )}
              <Grid item xs={12}>
                <input
                  accept=".pdf,.doc,.docx"
                  style={{ display: 'none' }}
                  id="offerLetter"
                  name="offerLetter"
                  type="file"
                  onChange={handleFileChange}
                />
                <label htmlFor="offerLetter">
                  <Button variant="contained" component="span">
                    Upload Offer Letter
                  </Button>
                </label>
                {formik.values.offerLetter && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Selected file: {formik.values.offerLetter.name}
                  </Typography>
                )}
                {formik.touched.offerLetter && formik.errors.offerLetter && (
                  <Typography color="error" variant="caption" display="block">
                    {formik.errors.offerLetter as string}
                  </Typography>
                )}
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                >
                  {loading ? 'Submitting...' : 'Submit'}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
} 