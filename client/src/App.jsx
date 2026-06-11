import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { AdminRoute } from './routes/PrivateRoute';
import ExpenseMemoPage from './pages/admin/ExpenseMemo/ExpenseMemoPage';
import FormationReport from './pages/admin/Reports/FormationReport';

// Composants communs
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import AdminLayout from './components/common/AdminLayout';

// Pages publiques
import Home from './pages/public/Home/Home';
import Formations from './pages/public/Formations/Formations';
import FormationDetail from './pages/public/FormationDetail/FormationDetail';
import Contact from './pages/public/Contact/Contact';
import About from './pages/public/About/About';
import Login from './pages/public/Login/Login';
import Register from './pages/public/Register/Register';
import NotFound from './pages/public/NotFound/NotFound';
import Forbidden from './pages/public/Forbidden/Forbidden';
import ForgotPassword from './pages/public/ForgotPassword/ForgotPassword';
import ResetPassword from './pages/public/ResetPassword/ResetPassword';
// ✅ NOUVEAU : Pages du blog
import Blog from './pages/public/Blog/Blog';
import BlogPost from './pages/public/Blog/BlogPost';

// Pages admin
import Dashboard from './pages/admin/Dashboard/Dashboard';
import FormationsList from './pages/admin/Formations/FormationsList';
import FormationForm from './pages/admin/Formations/FormationForm';
import AdminFormationDetail from './pages/admin/FormationDetail/FormationDetail';
import EnrollmentsList from './pages/admin/Enrollments/EnrollmentsList';
import AttendancesList from './pages/admin/Attendances/AttendancesList';
import CertificatesList from './pages/admin/Certificates/CertificatesList';
import UsersList from './pages/admin/Users/UsersList';
import UserDetail from './pages/admin/Users/UserDetail';
import DivisionsList from './pages/admin/Divisions/DivisionsList';
import GlobalSearch from './pages/admin/Search/GlobalSearch';
import Statistics from './pages/admin/Statistics/Statistics';
import PersonalTrainingsList from './pages/admin/PersonalTrainings/PersonalTrainingsList';
import Settings from './pages/admin/Settings/Settings';
import AdminsList from './pages/admin/Admins/AdminsList';
// ✅ NOUVEAU : Pages admin du blog
import BlogManager from './pages/admin/Blog/BlogManager';
import SuggestionsManager from './pages/admin/Blog/SuggestionsManager';

// Layout pour les pages publiques
function PublicLayout({ children }) {
  return (
    <div className="min-h-screen bg-white dark:bg-dark-bg flex flex-col">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <ThemeProvider>
        <AuthProvider>
          {/* Toaster avec support du thème sombre */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'var(--toast-bg, #ffffff)',
                color: 'var(--toast-color, #0f172a)',
                border: '1px solid var(--toast-border, #e2e8f0)',
                borderRadius: '12px',
                padding: '12px 16px',
                fontSize: '14px',
                fontWeight: '500',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: 'var(--toast-bg, #ffffff)',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: 'var(--toast-bg, #ffffff)',
                },
              },
              loading: {
                iconTheme: {
                  primary: '#6366f1',
                  secondary: 'var(--toast-bg, #ffffff)',
                },
              },
            }}
          />

          <Routes>
            {/* Redirection racine */}
            <Route path="/" element={<Navigate to="/home" replace />} />

            {/* Routes publiques */}
            <Route path="/home" element={<PublicLayout><Home /></PublicLayout>} />
            <Route path="/formations" element={<PublicLayout><Formations /></PublicLayout>} />
            <Route path="/formations/:id" element={<PublicLayout><FormationDetail /></PublicLayout>} />
            <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
            <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
            <Route path="/forbidden" element={<PublicLayout><Forbidden /></PublicLayout>} />
            {/* ✅ NOUVEAU : Routes du blog public */}
            <Route path="/blog" element={<PublicLayout><Blog /></PublicLayout>} />
            <Route path="/blog/:slug" element={<PublicLayout><BlogPost /></PublicLayout>} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<PublicLayout><NotFound /></PublicLayout>} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />

            {/* Routes admin (protégées) */}
            <Route element={<AdminRoute><AdminLayout /></AdminRoute>}>
              <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="/admin/dashboard" element={<Dashboard />} />

              {/* Formations */}
              <Route path="/admin/formations" element={<FormationsList />} />
              <Route path="/admin/formations/new" element={<FormationForm />} />
              <Route path="/admin/formations/:id" element={<AdminFormationDetail />} />
              <Route path="/admin/expense-memo/:id" element={<ExpenseMemoPage />} />
              {/* ✅ Route du rapport - UNE SEULE FOIS */}
              <Route path="/admin/reports/formation/:id" element={<FormationReport />} />

              {/* Gestion */}
              <Route path="/admin/enrollments" element={<EnrollmentsList />} />
              <Route path="/admin/attendances" element={<AttendancesList />} />
              <Route path="/admin/certificates" element={<CertificatesList />} />
              <Route path="/admin/personal-trainings" element={<PersonalTrainingsList />} />

              {/* Utilisateurs */}
              <Route path="/admin/users" element={<UsersList />} />
              <Route path="/admin/users/:id" element={<UserDetail />} />

              {/* Divers */}
              <Route path="/admin/divisions" element={<DivisionsList />} />
              <Route path="/admin/search" element={<GlobalSearch />} />
              <Route path="/admin/statistics" element={<Statistics />} />

              {/* ✅ NOUVEAU : Routes admin du blog */}
              <Route path="/admin/blog" element={<BlogManager />} />
              <Route path="/admin/suggestions" element={<SuggestionsManager />} />

              {/* Super Admin uniquement */}
              <Route path="/admin/settings" element={
                <AdminRoute superAdminOnly>
                  <Settings />
                </AdminRoute>
              } />
              <Route path="/admin/admins" element={
                <AdminRoute superAdminOnly>
                  <AdminsList />
                </AdminRoute>
              } />
            </Route>
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}