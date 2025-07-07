import React, { useEffect } from 'react';
import {
  Grid,
  Box,
  Typography,
  Chip,
  useTheme,
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  School as SchoolIcon,
  EventNote as EventNoteIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
} from '@mui/x-data-grid';
import { AppDispatch, RootState } from '../../store';
import { fetchDashboardStats, DashboardStats } from '../../store/slices/dashboardSlice';
import {
  PageHeader,
  StatsCard,
  LoadingSpinner,
  EmptyState,
  ActionButton,
} from '../../components/common/CommonComponents';

const Dashboard: React.FC = () => {
  const theme = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const { stats, loading, error } = useSelector((state: RootState) => state.dashboard);

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <EmptyState
        title="Error Loading Dashboard"
        message={error}
        action={
          <ActionButton onClick={() => dispatch(fetchDashboardStats())}>
            Retry
          </ActionButton>
        }
      />
    );
  }

  const chartData = [
    { month: 'Jan', internships: 20, odRequests: 15 },
    { month: 'Feb', internships: 25, odRequests: 18 },
    { month: 'Mar', internships: 30, odRequests: 22 },
    { month: 'Apr', internships: 28, odRequests: 20 },
    { month: 'May', internships: 35, odRequests: 25 },
    { month: 'Jun', internships: 40, odRequests: 30 },
  ];

  const internshipColumns: GridColDef[] = [
    { field: 'studentName', headerName: 'Student', flex: 1 },
    { field: 'company', headerName: 'Company', flex: 1 },
    { field: 'startDate', headerName: 'Start Date', flex: 1 },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value}
          color={
            params.value === 'completed'
              ? 'success'
              : params.value === 'ongoing'
              ? 'primary'
              : 'default'
          }
          size="small"
        />
      ),
    },
  ];

  const odColumns: GridColDef[] = [
    { field: 'studentName', headerName: 'Student', flex: 1 },
    { field: 'purpose', headerName: 'Purpose', flex: 1 },
    { field: 'date', headerName: 'Date', flex: 1 },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value}
          color={
            params.value === 'approved'
              ? 'success'
              : params.value === 'pending'
              ? 'warning'
              : 'error'
          }
          size="small"
        />
      ),
    },
  ];

  return (
    <Box>
      <PageHeader
        title="Dashboard"
        subtitle="Overview of internships and OD requests"
      />

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Total Students"
            value={stats?.totalStudents || 0}
            icon={<SchoolIcon />}
            trend={{
              value: 12,
              label: 'vs last month',
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Active Internships"
            value={stats?.activeInternships || 0}
            icon={<AssessmentIcon />}
            trend={{
              value: 8,
              label: 'vs last month',
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="OD Requests"
            value={stats?.odRequests || 0}
            icon={<EventNoteIcon />}
            trend={{
              value: -5,
              label: 'vs last month',
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Completed Internships"
            value={stats?.completedInternships || 0}
            icon={<CheckCircleIcon />}
            trend={{
              value: 15,
              label: 'vs last month',
            }}
          />
        </Grid>

        <Grid item xs={12}>
          <Box
            sx={{
              p: 3,
              bgcolor: 'background.paper',
              borderRadius: 2,
              boxShadow: 1,
              height: 400,
            }}
          >
            <Typography variant="h6" gutterBottom>
              Activity Overview
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey="internships"
                  name="Internships"
                  fill={theme.palette.primary.main}
                />
                <Bar
                  dataKey="odRequests"
                  name="OD Requests"
                  fill={theme.palette.secondary.main}
                />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <Box
            sx={{
              p: 3,
              bgcolor: 'background.paper',
              borderRadius: 2,
              boxShadow: 1,
            }}
          >
            <Typography variant="h6" gutterBottom>
              Recent Internships
            </Typography>
            <DataGrid
              rows={stats?.recentInternships || []}
              columns={internshipColumns}
              autoHeight
              pageSize={5}
              rowsPerPageOptions={[5]}
              disableSelectionOnClick
            />
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <Box
            sx={{
              p: 3,
              bgcolor: 'background.paper',
              borderRadius: 2,
              boxShadow: 1,
            }}
          >
            <Typography variant="h6" gutterBottom>
              Recent OD Requests
            </Typography>
            <DataGrid
              rows={stats?.recentODRequests || []}
              columns={odColumns}
              autoHeight
              pageSize={5}
              rowsPerPageOptions={[5]}
              disableSelectionOnClick
            />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 