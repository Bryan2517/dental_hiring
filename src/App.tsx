import { Routes, Route, Navigate } from 'react-router-dom';
import SeekersLanding from './pages/Marketing/SeekersLanding';
import EmployersLanding from './pages/Marketing/EmployersLanding';
import JobsList from './pages/Jobs/JobsList';
import JobDetails from './pages/Jobs/JobDetails';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ProfileDashboard from './pages/Profile/ProfileDashboard';
import EmployerDashboard from './pages/Employer/EmployerDashboard';
import PostJob from './pages/Employer/PostJob';
import ApplicantsPipeline from './pages/Employer/ApplicantsPipeline';
import AdminDashboard from './pages/Admin/AdminDashboard';
import About from './pages/Marketing/About';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/seekers" replace />} />
      <Route path="/seekers" element={<SeekersLanding />} />
      <Route path="/employers" element={<EmployersLanding />} />
      <Route path="/about" element={<About />} />
      <Route path="/jobs" element={<JobsList />} />
      <Route path="/jobs/:id" element={<JobDetails />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/student/profile" element={<ProtectedRoute><ProfileDashboard /></ProtectedRoute>} />
      <Route
        path="/employer/dashboard"
        element={
          <ProtectedRoute requiredRole="employer">
            <EmployerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employer/post-job"
        element={
          <ProtectedRoute requiredRole="employer">
            <PostJob />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employer/applicants"
        element={
          <ProtectedRoute requiredRole="employer">
            <ApplicantsPipeline />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
