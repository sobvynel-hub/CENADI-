import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { AdminRoute, RoleRedirect } from './routes/PrivateRoute';
import PublicAccessGuard from './middleware/PublicAccessGuard';

// Layouts
import Layout from './components/common/Layout';
import AdminLayout from './components/common/AdminLayout';

// Pages publiques
import Home from './pages/public/Home/Home';
import Formations from './pages/public/Formations/Formations';
import FormationDetail from './pages/public/FormationDetail/FormationDetail';
import Blog from './pages/public/Blog/Blog';
import BlogPost from './pages/public/Blog/BlogPost';
import About from './pages/public/About/About';
import Contact from './pages/public/Contact/Contact';
import Login from './pages/public/Login/Login';
import Register from './pages/public/Register/Register';
import ForgotPassword from './pages/public/ForgotPassword/ForgotPassword';
import ResetPassword from './pages/public/ResetPassword/ResetPassword';
import Maintenance from './pages/public/Maintenance/Maintenance';
import Forbidden from './pages/public/Forbidden/Forbidden';
import NotFound from './pages/public/NotFound/NotFound';

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
import BlogManager from './pages/admin/Blog/BlogManager';
import SuggestionsManager from './pages/admin/Blog/SuggestionsManager';
import ExpenseMemoPage from './pages/admin/ExpenseMemo/ExpenseMemoPage';
import FormationReport from './pages/admin/Reports/FormationReport';

console.log('🚀 App chargée');

function App() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <ThemeProvider>
        <AuthProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#ffffff',
                color: '#0f172a',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '12px 16px',
                fontSize: '14px',
                fontWeight: '500',
              },
            }}
          />

          <Routes>
            {/* Redirection racine avec RoleRedirect */}
            <Route 
              path="/" 
              element={
                <RoleRedirect>
                  <Navigate to="/home" replace />
                </RoleRedirect>
              } 
            />

            {/* 🔓 Routes d'authentification */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/maintenance" element={<Maintenance />} />
            <Route path="/forbidden" element={<Forbidden />} />

            {/* 🏠 Routes publiques avec RoleRedirect pour rediriger les admins */}
            <Route 
              path="/home" 
              element={
                <RoleRedirect>
                  <Layout>
                    <Home />
                  </Layout>
                </RoleRedirect>
              } 
            />
            
            <Route 
              path="/formations" 
              element={
                <RoleRedirect>
                  <Layout>
                    <Formations />
                  </Layout>
                </RoleRedirect>
              } 
            />
            
            <Route 
              path="/formations/:id" 
              element={
                <RoleRedirect>
                  <Layout>
                    <FormationDetail />
                  </Layout>
                </RoleRedirect>
              } 
            />
            
            <Route 
              path="/blog" 
              element={
                <RoleRedirect>
                  <Layout>
                    <Blog />
                  </Layout>
                </RoleRedirect>
              } 
            />
            
            <Route 
              path="/blog/:slug" 
              element={
                <RoleRedirect>
                  <Layout>
                    <BlogPost />
                  </Layout>
                </RoleRedirect>
              } 
            />
            
            <Route 
              path="/about" 
              element={
                <RoleRedirect>
                  <Layout>
                    <About />
                  </Layout>
                </RoleRedirect>
              } 
            />
            
            <Route 
              path="/contact" 
              element={
                <RoleRedirect>
                  <Layout>
                    <Contact />
                  </Layout>
                </RoleRedirect>
              } 
            />

            {/* 🔐 Routes Admin avec AdminLayout ET AdminRoute */}
            <Route 
              path="/admin/dashboard" 
              element={
                <AdminRoute>
                  <AdminLayout>
                    <Dashboard />
                  </AdminLayout>
                </AdminRoute>
              } 
            />
            
            <Route 
              path="/admin/formations" 
              element={
                <AdminRoute>
                  <AdminLayout>
                    <FormationsList />
                  </AdminLayout>
                </AdminRoute>
              } 
            />
            
            <Route 
              path="/admin/formations/new" 
              element={
                <AdminRoute>
                  <AdminLayout>
                    <FormationForm />
                  </AdminLayout>
                </AdminRoute>
              } 
            />
            
            <Route 
              path="/admin/formations/:id" 
              element={
                <AdminRoute>
                  <AdminLayout>
                    <AdminFormationDetail />
                  </AdminLayout>
                </AdminRoute>
              } 
            />
            
            <Route 
              path="/admin/enrollments" 
              element={
                <AdminRoute>
                  <AdminLayout>
                    <EnrollmentsList />
                  </AdminLayout>
                </AdminRoute>
              } 
            />
            
            <Route 
              path="/admin/attendances" 
              element={
                <AdminRoute>
                  <AdminLayout>
                    <AttendancesList />
                  </AdminLayout>
                </AdminRoute>
              } 
            />
            
            <Route 
              path="/admin/certificates" 
              element={
                <AdminRoute>
                  <AdminLayout>
                    <CertificatesList />
                  </AdminLayout>
                </AdminRoute>
              } 
            />
            
            <Route 
              path="/admin/users" 
              element={
                <AdminRoute>
                  <AdminLayout>
                    <UsersList />
                  </AdminLayout>
                </AdminRoute>
              } 
            />
            
            <Route 
              path="/admin/users/:id" 
              element={
                <AdminRoute>
                  <AdminLayout>
                    <UserDetail />
                  </AdminLayout>
                </AdminRoute>
              } 
            />
            
            <Route 
              path="/admin/divisions" 
              element={
                <AdminRoute>
                  <AdminLayout>
                    <DivisionsList />
                  </AdminLayout>
                </AdminRoute>
              } 
            />
            
            <Route 
              path="/admin/personal-trainings" 
              element={
                <AdminRoute>
                  <AdminLayout>
                    <PersonalTrainingsList />
                  </AdminLayout>
                </AdminRoute>
              } 
            />
            
            <Route 
              path="/admin/expense-memo/:id" 
              element={
                <AdminRoute>
                  <AdminLayout>
                    <ExpenseMemoPage />
                  </AdminLayout>
                </AdminRoute>
              } 
            />
            
            <Route 
              path="/admin/reports/formation/:id" 
              element={
                <AdminRoute>
                  <AdminLayout>
                    <FormationReport />
                  </AdminLayout>
                </AdminRoute>
              } 
            />
            
            <Route 
              path="/admin/search" 
              element={
                <AdminRoute>
                  <AdminLayout>
                    <GlobalSearch />
                  </AdminLayout>
                </AdminRoute>
              } 
            />
            
            <Route 
              path="/admin/statistics" 
              element={
                <AdminRoute>
                  <AdminLayout>
                    <Statistics />
                  </AdminLayout>
                </AdminRoute>
              } 
            />
            
            <Route 
              path="/admin/blog" 
              element={
                <AdminRoute>
                  <AdminLayout>
                    <BlogManager />
                  </AdminLayout>
                </AdminRoute>
              } 
            />
            
            <Route 
              path="/admin/suggestions" 
              element={
                <AdminRoute>
                  <AdminLayout>
                    <SuggestionsManager />
                  </AdminLayout>
                </AdminRoute>
              } 
            />
            
            {/* Super Admin uniquement */}
            <Route 
              path="/admin/settings" 
              element={
                <AdminRoute superAdminOnly>
                  <AdminLayout>
                    <Settings />
                  </AdminLayout>
                </AdminRoute>
              } 
            />
            
            <Route 
              path="/admin/admins" 
              element={
                <AdminRoute superAdminOnly>
                  <AdminLayout>
                    <AdminsList />
                  </AdminLayout>
                </AdminRoute>
              } 
            />

            {/* 404 */}
            <Route path="*" element={<Layout><NotFound /></Layout>} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;