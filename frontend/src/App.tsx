import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { RootState, AppDispatch } from './store';
import { loadUser } from './store/slices/authSlice';

// Components
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import StudentDashboard from './components/student/StudentDashboard';
import FacultyDashboard from './components/faculty/FacultyDashboard';
import InternshipForm from './components/internship/InternshipForm';
import ODRequests from './components/od/ODRequests';
import Layout from './components/layout/Layout';
import Announcements from './components/announcements/Announcements';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const FacultyRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  return isAuthenticated && user?.role === 'faculty' ? (
    <>{children}</>
  ) : (
    <Navigate to="/login" />
  );
};

function App() {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, user, loading } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (localStorage.getItem('token')) {
      dispatch(loadUser());
    }
  }, [dispatch]);

  if (loading) {
    return null; // or a loading spinner
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route
            path="/login"
            element={!isAuthenticated ? <Login /> : <Navigate to="/" />}
          />
          <Route
            path="/register"
            element={!isAuthenticated ? <Register /> : <Navigate to="/" />}
          />
          <Route
            path="/"
            element={isAuthenticated ? <Layout /> : <Navigate to="/login" />}
          >
            <Route
              index
              element={
                user?.role === 'student' ? (
                  <StudentDashboard />
                ) : (
                  <FacultyDashboard />
                )
              }
            />
            <Route
              path="internship/new"
              element={
                user?.role === 'student' ? (
                  <InternshipForm />
                ) : (
                  <Navigate to="/" />
                )
              }
            />
            <Route path="od" element={<ODRequests />} />
            <Route path="announcements" element={<Announcements />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
