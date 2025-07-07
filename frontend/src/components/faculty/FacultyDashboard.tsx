import React from 'react';
import { useSelector } from 'react-redux';
import { Box, Tab, Tabs } from '@mui/material';
import ODApproval from './ODApproval';
import Announcements from '../announcements/Announcements';
import DashboardStats from './DashboardStats';
import { RootState } from '../../store';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`faculty-tabpanel-${index}`}
      aria-labelledby={`faculty-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `faculty-tab-${index}`,
    'aria-controls': `faculty-tabpanel-${index}`,
  };
}

export default function FacultyDashboard() {
  const [value, setValue] = React.useState(0);
  const { user } = useSelector((state: RootState) => state.auth);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  // Show only relevant tabs based on faculty roles
  const showODApproval = user?.facultyRoles?.some(role => 
    ['class_advisor', 'mentor', 'hod', 'internship_coordinator'].includes(role)
  );

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} aria-label="faculty dashboard tabs">
          <Tab label="Dashboard" {...a11yProps(0)} />
          {showODApproval && <Tab label="OD Requests" {...a11yProps(1)} />}
          <Tab label="Announcements" {...a11yProps(showODApproval ? 2 : 1)} />
        </Tabs>
      </Box>
      <TabPanel value={value} index={0}>
        <DashboardStats />
      </TabPanel>
      {showODApproval && (
        <TabPanel value={value} index={1}>
          <ODApproval />
        </TabPanel>
      )}
      <TabPanel value={value} index={showODApproval ? 2 : 1}>
        <Announcements />
      </TabPanel>
    </Box>
  );
} 