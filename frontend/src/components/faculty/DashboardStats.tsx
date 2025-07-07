import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Paper,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { AppDispatch, RootState } from '../../store';
import type { InternshipStats, ODStats } from '../../types';
import * as XLSX from 'xlsx';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

interface ExcelInternship {
  registerNumber: string;
  organisationName: string;
  natureOfWork: string;
  modeOfInternship: string;
  startDate: string;
  completionDate: string;
  stipend: string;
  stipendAmount?: number;
}

export default function DashboardStats() {
  const dispatch = useDispatch<AppDispatch>();
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const { internshipStats, odStats, loading, error } = useSelector(
    (state: RootState) => state.dashboard
  );

  const handleExcelUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json<ExcelInternship>(worksheet);

      // Validate and transform data
      const internships = jsonData.map(row => ({
        ...row,
        modeOfInternship: row.modeOfInternship.toLowerCase(),
        startDate: new Date(row.startDate).toISOString(),
        completionDate: new Date(row.completionDate).toISOString(),
        stipendAmount: row.stipend === 'Yes' ? row.stipendAmount : undefined
      }));

      // Send to backend
      await dispatch(importInternshipsFromExcel(internships)).unwrap();
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Failed to process Excel file');
    } finally {
      setUploading(false);
    }
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

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Internship Statistics */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Internship Overview
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4">{internshipStats.totalInternships}</Typography>
                    <Typography variant="body2">Total Internships</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4">{internshipStats.approvedInternships}</Typography>
                    <Typography variant="body2">Approved</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4">{internshipStats.pendingInternships}</Typography>
                    <Typography variant="body2">Pending</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4">
                      ₹{internshipStats.averageStipend.toFixed(0)}
                    </Typography>
                    <Typography variant="body2">Avg. Stipend/month</Typography>
                  </Paper>
                </Grid>
              </Grid>

              <Box sx={{ height: 300, mt: 3 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={Object.entries(internshipStats.byMonth).map(([month, count]) => ({
                    month,
                    count
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#8884d8" name="Internships" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* OD Statistics */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                OD Request Overview
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4">{odStats.totalODs}</Typography>
                    <Typography variant="body2">Total OD Requests</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4">{odStats.approvedODs}</Typography>
                    <Typography variant="body2">Approved</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4">{odStats.pendingODs}</Typography>
                    <Typography variant="body2">Pending</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4">{odStats.averageDuration.toFixed(1)}</Typography>
                    <Typography variant="body2">Avg. Duration (days)</Typography>
                  </Paper>
                </Grid>
              </Grid>

              <Box sx={{ height: 300, mt: 3 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Approved', value: odStats.approvedODs },
                        { name: 'Pending', value: odStats.pendingODs },
                        { name: 'Rejected', value: odStats.rejectedODs }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {COLORS.map((color, index) => (
                        <Cell key={`cell-${index}`} fill={color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Excel Import Section */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Import Internship Data
              </Typography>
              <Box sx={{ mt: 2 }}>
                <input
                  accept=".xlsx,.xls"
                  style={{ display: 'none' }}
                  id="excel-file-upload"
                  type="file"
                  onChange={handleExcelUpload}
                  disabled={uploading}
                />
                <label htmlFor="excel-file-upload">
                  <Button
                    variant="contained"
                    component="span"
                    disabled={uploading}
                  >
                    {uploading ? 'Uploading...' : 'Upload Excel File'}
                  </Button>
                </label>
                {uploadError && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {uploadError}
                  </Alert>
                )}
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  Upload an Excel file containing internship details. The file should have columns for:
                  Register Number, Organization Name, Nature of Work, Mode of Internship, Start Date,
                  Completion Date, Stipend, and Stipend Amount.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
} 