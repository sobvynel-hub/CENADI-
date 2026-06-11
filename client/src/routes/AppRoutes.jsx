import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import Layout from '../components/common/Layout';
import AdminLayout from '../components/common/AdminLayout';
import { AdminRoute } from './PrivateRoute';
import Loader from '../components/common/Loader';

/* ─── Pages publiques ─── */
const Home = lazy(() => import('../pages/public/Home/Home'));
const Formations = lazy(() => import('../pages/public/Formations/Formations'));
const FormationDetail = lazy(() => import('../pages/public/FormationDetail/FormationDetail'));
const Contact = lazy(() => import('../pages/public/Contact/Contact'));
const About = lazy(() => import('../pages/public/About/About'));
const Login = lazy(() => import('../pages/public/Login/Login'));
const Register = lazy(() => import('../pages/public/Register/Register'));
const NotFound = lazy(() => import('../pages/public/NotFound/NotFound'));
const Forbidden = lazy(() => import('../pages/public/Forbidden/Forbidden'));
// ✅ NOUVEAU : Pages du blog
const Blog = lazy(() => import('../pages/public/Blog/Blog'));
const BlogPost = lazy(() => import('../pages/public/Blog/BlogPost'));

/* ─── Pages admin ─── */
const Dashboard = lazy(() => import('../pages/admin/Dashboard/Dashboard'));
const FormationsList = lazy(() => import('../pages/admin/Formations/FormationsList'));
const FormationForm = lazy(() => import('../pages/admin/Formations/FormationForm'));
const AdminFormationDetail = lazy(() => import('../pages/admin/FormationDetail/FormationDetail'));
const EnrollmentsList = lazy(() => import('../pages/admin/Enrollments/EnrollmentsList'));
const AttendancesList = lazy(() => import('../pages/admin/Attendances/AttendancesList'));
const CertificatesList = lazy(() => import('../pages/admin/Certificates/CertificatesList'));
const UsersList = lazy(() => import('../pages/admin/Users/UsersList'));
const UserDetail = lazy(() => import('../pages/admin/Users/UserDetail'));
const GlobalSearch = lazy(() => import('../pages/admin/Search/GlobalSearch'));
const Statistics = lazy(() => import('../pages/admin/Statistics/Statistics'));
const PersonalTrainingsList = lazy(() => import('../pages/admin/PersonalTrainings/PersonalTrainingsList'));
// ✅ NOUVEAU : Pages admin du blog
const BlogManager = lazy(() => import('../pages/admin/Blog/BlogManager'));
const SuggestionsManager = lazy(() => import('../pages/admin/Blog/SuggestionsManager'));
/* Super admin uniquement */
const Settings = lazy(() => import('../pages/admin/Settings/Settings'));
const AdminsList = lazy(() => import('../pages/admin/Admins/AdminsList'));

function Wrap({ children }) {
  return <Suspense fallback={<Loader fullScreen />}>{children}</Suspense>;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* ── Redirection racine ── */}
      <Route path="/" element={<Navigate to="/home" replace />} />

      {/* ── Routes publiques ── */}
      <Route element={<Layout />}>
        <Route path="/home" element={<Wrap><Home /></Wrap>} />
        <Route path="/formations" element={<Wrap><Formations /></Wrap>} />
        <Route path="/formations/:id" element={<Wrap><FormationDetail /></Wrap>} />
        <Route path="/about" element={<Wrap><About /></Wrap>} />
        <Route path="/contact" element={<Wrap><Contact /></Wrap>} />
        <Route path="/forbidden" element={<Wrap><Forbidden /></Wrap>} />
        {/* ✅ NOUVEAU : Routes du blog public */}
        <Route path="/blog" element={<Wrap><Blog /></Wrap>} />
        <Route path="/blog/:slug" element={<Wrap><BlogPost /></Wrap>} />
      </Route>
      
      <Route path="/login" element={<Wrap><Login /></Wrap>} />
      <Route path="/register" element={<Wrap><Register /></Wrap>} />
      <Route path="*" element={<Layout><Wrap><NotFound /></Wrap></Layout>} />

      {/* ── Routes admin (protégées) ── */}
      <Route element={<AdminRoute><AdminLayout /></AdminRoute>}>
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin/dashboard" element={<Wrap><Dashboard /></Wrap>} />

        {/* Formations */}
        <Route path="/admin/formations" element={<Wrap><FormationsList /></Wrap>} />
        <Route path="/admin/formations/new" element={<Wrap><FormationForm /></Wrap>} />
        <Route path="/admin/formations/:id" element={<Wrap><AdminFormationDetail /></Wrap>} />

        {/* Gestion */}
        <Route path="/admin/enrollments" element={<Wrap><EnrollmentsList /></Wrap>} />
        <Route path="/admin/attendances" element={<Wrap><AttendancesList /></Wrap>} />
        <Route path="/admin/certificates" element={<Wrap><CertificatesList /></Wrap>} />
        <Route path="/admin/personal-trainings" element={<Wrap><PersonalTrainingsList /></Wrap>} />

        {/* Utilisateurs */}
        <Route path="/admin/users" element={<Wrap><UsersList /></Wrap>} />
        <Route path="/admin/users/:id" element={<Wrap><UserDetail /></Wrap>} />

        {/* Divers */}
        <Route path="/admin/search" element={<Wrap><GlobalSearch /></Wrap>} />
        <Route path="/admin/statistics" element={<Wrap><Statistics /></Wrap>} />

        {/* ✅ NOUVEAU : Routes admin du blog */}
        <Route path="/admin/blog" element={<Wrap><BlogManager /></Wrap>} />
        <Route path="/admin/suggestions" element={<Wrap><SuggestionsManager /></Wrap>} />

        {/* Super Admin uniquement */}
        <Route path="/admin/settings" element={
          <AdminRoute superAdminOnly>
            <Wrap><Settings /></Wrap>
          </AdminRoute>
        } />
        <Route path="/admin/admins" element={
          <AdminRoute superAdminOnly>
            <Wrap><AdminsList /></Wrap>
          </AdminRoute>
        } />
      </Route>
    </Routes>
  );
}