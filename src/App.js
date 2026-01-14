import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Routes, Route, Navigate } from 'react-router-dom';
import SeekersLanding from './pages/Marketing/SeekersLanding';
import EmployersLanding from './pages/Marketing/EmployersLanding';
import JobsList from './pages/Jobs/JobsList';
import JobDetails from './pages/Jobs/JobDetails';
import ProfileDashboard from './pages/Profile/ProfileDashboard';
import EmployerDashboard from './pages/Employer/EmployerDashboard';
import PostJob from './pages/Employer/PostJob';
import ApplicantsPipeline from './pages/Employer/ApplicantsPipeline';
import AdminDashboard from './pages/Admin/AdminDashboard';
import About from './pages/Marketing/About';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthModal } from './components/AuthModal';
import OrganizationProfile from './pages/Employer/OrganizationProfile';
function App() {
    return (_jsxs(_Fragment, { children: [_jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(Navigate, { to: "/seekers", replace: true }) }), _jsx(Route, { path: "/seekers", element: _jsx(SeekersLanding, {}) }), _jsx(Route, { path: "/employers", element: _jsx(EmployersLanding, {}) }), _jsx(Route, { path: "/about", element: _jsx(About, {}) }), _jsx(Route, { path: "/jobs", element: _jsx(JobsList, {}) }), _jsx(Route, { path: "/jobs/:id", element: _jsx(JobDetails, {}) }), _jsx(Route, { path: "/student/profile", element: _jsx(ProtectedRoute, { requiredRole: "seeker", children: _jsx(ProfileDashboard, {}) }) }), _jsx(Route, { path: "/employer/dashboard", element: _jsx(ProtectedRoute, { requiredRole: "employer", children: _jsx(EmployerDashboard, {}) }) }), _jsx(Route, { path: "/employer/post-job", element: _jsx(ProtectedRoute, { requiredRole: "employer", children: _jsx(PostJob, {}) }) }), _jsx(Route, { path: "/employer/applicants", element: _jsx(ProtectedRoute, { requiredRole: "employer", children: _jsx(ApplicantsPipeline, {}) }) }), _jsx(Route, { path: "/employer/profile", element: _jsx(ProtectedRoute, { requiredRole: "employer", children: _jsx(OrganizationProfile, {}) }) }), _jsx(Route, { path: "/admin", element: _jsx(ProtectedRoute, { requiredRole: "admin", children: _jsx(AdminDashboard, {}) }) }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/", replace: true }) })] }), _jsx(AuthModal, {})] }));
}
export default App;
