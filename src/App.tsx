import { Routes, Route, Navigate } from 'react-router-dom';
import SeekersLanding from './pages/Marketing/SeekersLanding';
import EmployersLanding from './pages/Marketing/EmployersLanding';
import JobsList from './pages/Jobs/JobsList';
import JobDetails from './pages/Jobs/JobDetails';
import Register from './pages/Auth/Register';
import ProfileDashboard from './pages/Profile/ProfileDashboard';
import EmployerDashboard from './pages/Employer/EmployerDashboard';
import PostJob from './pages/Employer/PostJob';
import ApplicantsPipeline from './pages/Employer/ApplicantsPipeline';
import AdminDashboard from './pages/Admin/AdminDashboard';
import About from './pages/Marketing/About';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/seekers" replace />} />
      <Route path="/seekers" element={<SeekersLanding />} />
      <Route path="/employers" element={<EmployersLanding />} />
      <Route path="/about" element={<About />} />
      <Route path="/jobs" element={<JobsList />} />
      <Route path="/jobs/:id" element={<JobDetails />} />
      <Route path="/register" element={<Register />} />
      <Route path="/student/profile" element={<ProfileDashboard />} />
      <Route path="/employer/dashboard" element={<EmployerDashboard />} />
      <Route path="/employer/post-job" element={<PostJob />} />
      <Route path="/employer/applicants" element={<ApplicantsPipeline />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
