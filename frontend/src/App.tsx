import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { SettingsProvider } from '@/contexts/SettingsContext';
import PublicLayout from '@/layouts/PublicLayout';
import AdminLayout from '@/layouts/AdminLayout';
import LoadingScreen from '@/components/ui/LoadingScreen';
import CookieBanner from '@/components/ui/CookieBanner';

// ─── Lazy-loaded offentlige sider ───
const HomePage         = lazy(() => import('@/pages/public/HomePage'));
const CarsPage         = lazy(() => import('@/pages/public/CarsPage'));
const CarDetailPage    = lazy(() => import('@/pages/public/CarDetailPage'));
const TradeInPage      = lazy(() => import('@/pages/public/TradeInPage'));
const WorkshopPage     = lazy(() => import('@/pages/public/WorkshopPage'));
const ServiceDetailPage = lazy(() => import('@/pages/public/ServiceDetailPage'));
const BookingPage      = lazy(() => import('@/pages/public/BookingPage'));
const FinancingPage    = lazy(() => import('@/pages/public/FinancingPage'));
const AboutPage        = lazy(() => import('@/pages/public/AboutPage'));
const ContactPage      = lazy(() => import('@/pages/public/ContactPage'));
const PrivacyPage      = lazy(() => import('@/pages/public/PrivacyPage'));
const CookiePolicyPage = lazy(() => import('@/pages/public/CookiePolicyPage'));
const NotFoundPage     = lazy(() => import('@/pages/public/NotFoundPage'));
const VehicleLookupPage = lazy(() => import('@/pages/public/VehicleLookupPage'));

// ─── Lazy-loaded admin sider ───
const AdminLoginPage    = lazy(() => import('@/pages/admin/LoginPage'));
const AdminDashboard    = lazy(() => import('@/pages/admin/DashboardPage'));
const AdminCarsPage     = lazy(() => import('@/pages/admin/CarsPage'));
const AdminCarFormPage  = lazy(() => import('@/pages/admin/CarFormPage'));
const AdminLeadsPage    = lazy(() => import('@/pages/admin/LeadsPage'));
const AdminLeadDetail   = lazy(() => import('@/pages/admin/LeadDetailPage'));
const AdminTradeInsPage = lazy(() => import('@/pages/admin/TradeInsPage'));
const AdminWorkshopPage = lazy(() => import('@/pages/admin/WorkshopPage'));
const AdminContentPage  = lazy(() => import('@/pages/admin/ContentPage'));
const AdminSettingsPage = lazy(() => import('@/pages/admin/SettingsPage'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 1,
    },
  },
});

// Beskyttet admin-rute
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <SettingsProvider>
            <BrowserRouter>
              <CookieBanner />
              <Suspense fallback={<LoadingScreen />}>
                <Routes>
                  {/* ─── Offentlige ruter ─── */}
                  <Route element={<PublicLayout />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/biler" element={<CarsPage />} />
                    <Route path="/biler/:slug" element={<CarDetailPage />} />
                    <Route path="/saelg-eller-byt" element={<TradeInPage />} />
                    <Route path="/vaerksted" element={<WorkshopPage />} />
                    <Route path="/vaerksted/:slug" element={<ServiceDetailPage />} />
                    <Route path="/book-vaerksted" element={<BookingPage />} />
                    <Route path="/finansiering" element={<FinancingPage />} />
                    <Route path="/om-os" element={<AboutPage />} />
                    <Route path="/kontakt" element={<ContactPage />} />
                    <Route path="/privatlivspolitik" element={<PrivacyPage />} />
                    <Route path="/cookiepolitik" element={<CookiePolicyPage />} />
                    <Route path="/tjek-bil" element={<VehicleLookupPage />} />
                    <Route path="*" element={<NotFoundPage />} />
                  </Route>

                  {/* ─── Admin-ruter ─── */}
                  <Route path="/admin/login" element={<AdminLoginPage />} />
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute>
                        <AdminLayout />
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<AdminDashboard />} />
                    <Route path="biler" element={<AdminCarsPage />} />
                    <Route path="biler/ny" element={<AdminCarFormPage />} />
                    <Route path="biler/:id/rediger" element={<AdminCarFormPage />} />
                    <Route path="henvendelser" element={<AdminLeadsPage />} />
                    <Route path="henvendelser/:id" element={<AdminLeadDetail />} />
                    <Route path="koeb-bytte" element={<AdminTradeInsPage />} />
                    <Route path="vaerksted" element={<AdminWorkshopPage />} />
                    <Route path="indhold" element={<AdminContentPage />} />
                    <Route path="indstillinger" element={<AdminSettingsPage />} />
                  </Route>
                </Routes>
              </Suspense>
            </BrowserRouter>
          </SettingsProvider>
        </AuthProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}
