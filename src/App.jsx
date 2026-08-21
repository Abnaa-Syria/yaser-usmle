import { lazy } from "react";
import { BrowserRouter, Navigate, Route, Routes, useParams } from "react-router-dom";
import Layout from "./components/Layout";
import ThemeHtmlSync from "./components/ThemeHtmlSync";
import RouterNavigationBridge from "./components/RouterNavigationBridge";
import { RouteSuspense } from "./components/LoadingFallback";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";
import NotFound from "./pages/NotFound";
import AdminRoutes from "./routes/adminRoutes";
import InstructorRoutes from "./routes/instructorRoutes";
import StudentRoutes from "./routes/studentRoutes";
import useAuthStore from "./store/authStore";
import { platformFeatures } from "./config/features";
import TrialOfferModal from "./components/trial/TrialOfferModal";
import MaintenanceGate from "./components/MaintenanceGate";

const Explore = lazy(() => import("./pages/Explore"));
const Instructors = lazy(() => import("./pages/Instructors"));
const InstructorProfile = lazy(() => import("./pages/InstructorProfile"));
const CourseDetails = lazy(() => import("./pages/CourseDetails"));
const Subscription = lazy(() => import("./pages/Subscription"));
const PackageDetails = lazy(() => import("./pages/PackageDetails"));
const FaqPage = lazy(() => import("./pages/FaqPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const BlogsPage = lazy(() => import("./pages/BlogsPage"));
const BlogPostPage = lazy(() => import("./pages/BlogPostPage"));
const StaticContentPage = lazy(() => import("./pages/StaticContentPage"));
const VerifyCertificate = lazy(() => import("./pages/VerifyCertificate"));
const AccessDenied = lazy(() => import("./pages/AccessDenied"));
const EventsPage = lazy(() => import("./pages/public/Events"));
const TrialLayout = lazy(() => import("./layouts/TrialLayout"));
const TrialDashboard = lazy(() => import("./pages/trial/TrialDashboard"));
const TrialClasses = lazy(() => import("./pages/trial/TrialClasses"));
const TrialCourseLearn = lazy(() => import("./pages/trial/TrialCourseLearn"));
const TrialRecordings = lazy(() => import("./pages/trial/TrialRecordings"));
const TrialMockFeature = lazy(() => import("./pages/trial/TrialMockFeature"));
const TrialStudyPlanPage = lazy(() => import("./pages/trial/TrialMockPages").then((m) => ({ default: m.TrialStudyPlanPage })));
const TrialQnaPage = lazy(() => import("./pages/trial/TrialMockPages").then((m) => ({ default: m.TrialQnaPage })));
const TrialProgressPage = lazy(() =>
  import("./pages/trial/TrialMockPages").then((m) => ({ default: m.TrialProgressPage }))
);
const CoursologyQbank = lazy(() => import("./pages/student/CoursologyQbank"));
const TrialCertificatesPage = lazy(() =>
  import("./pages/trial/TrialMockPages").then((m) => ({ default: m.TrialCertificatesPage }))
);
const TrialTicketsPage = lazy(() =>
  import("./pages/trial/TrialMockPages").then((m) => ({ default: m.TrialTicketsPage }))
);
const TrialSettingsPage = lazy(() =>
  import("./pages/trial/TrialMockPages").then((m) => ({ default: m.TrialSettingsPage }))
);
const Exams = lazy(() => import("./pages/Exams"));
const ExamDetails = lazy(() => import("./pages/ExamDetails"));
const ExamResult = lazy(() => import("./pages/ExamResult"));
const TakeExam = lazy(() => import("./pages/TakeExam"));
const StudentFlashcards = lazy(() => import("./pages/student/Flashcards"));

function wrap(node) {
  return <RouteSuspense>{node}</RouteSuspense>;
}

function RedirectLockedTrial() {
  const { feature } = useParams();
  const allowed = ["certificates", "tickets", "settings", "progress", "qna", "study-plan", "exams", "flashcards", "recordings"];
  const target = allowed.includes(feature) ? `/trial/${feature}` : "/trial";
  return <Navigate to={target} replace />;
}

function RoleLanding() {
  const hydrated = useAuthStore((s) => s.hydrated);

  // Always show the public homepage here.
  // Role-based dashboard redirects happen after login/signup, not on every visit to "/".
  if (!hydrated) return null;
  return <Home />;
}

function App() {
  return (
    <BrowserRouter>
      <ThemeHtmlSync />
      <RouterNavigationBridge />
      <MaintenanceGate>
      <Routes>
        {/* Auth pages — standalone (no Header/Footer) */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/verify-email/:token" element={<VerifyEmail />} />
        <Route path="/access-denied" element={wrap(<AccessDenied />)} />

        {/* Main app shell with Header + Footer */}
        <Route element={<Layout />}>
          <Route index element={<RoleLanding />} />
          <Route path="/explore" element={wrap(<Explore />)} />
          <Route
            path="/instructors"
            element={
              platformFeatures.publicInstructorCatalog || platformFeatures.privateBooking
                ? wrap(<Instructors />)
                : <Navigate to="/about" replace />
            }
          />
          <Route
            path="/instructors/:id"
            element={
              platformFeatures.publicInstructorCatalog || platformFeatures.privateBooking
                ? wrap(<InstructorProfile />)
                : <Navigate to="/about" replace />
            }
          />
          <Route path="/courses" element={wrap(<Explore />)} />
          <Route path="/packages" element={wrap(<Subscription />)} />
          <Route path="/packages/:id" element={wrap(<PackageDetails />)} />
          <Route path="/subscription" element={<Navigate to="/packages" replace />} />
          <Route path="/faq" element={wrap(<FaqPage />)} />
          <Route path="/events" element={platformFeatures.communityEvents ? wrap(<EventsPage />) : <Navigate to="/blogs" replace />} />
          <Route path="/about" element={wrap(<AboutPage />)} />
          <Route path="/contact" element={wrap(<StaticContentPage slug="contact" showContactInfo />)} />
          <Route path="/community" element={<Navigate to="/about" replace />} />
          <Route path="/library" element={wrap(<StaticContentPage slug="library" />)} />
          <Route path="/guide" element={wrap(<StaticContentPage slug="user-guide" />)} />
          <Route path="/terms" element={wrap(<StaticContentPage slug="terms" />)} />
          <Route path="/privacy" element={wrap(<StaticContentPage slug="privacy" />)} />
          <Route path="/refund-policy" element={wrap(<StaticContentPage slug="refund-policy" />)} />
          <Route path="/teach" element={wrap(<StaticContentPage slug="teach" />)} />
          <Route path="/blogs" element={wrap(<BlogsPage />)} />
          <Route path="/blogs/:slug" element={wrap(<BlogPostPage />)} />
          <Route path="/courses/:id" element={wrap(<CourseDetails />)} />
          <Route path="/verify-certificate/:serial" element={wrap(<VerifyCertificate />)} />
        </Route>

        <Route path="/admin/dashboard" element={<Navigate to="/admin" replace />} />
        {AdminRoutes()}
        {InstructorRoutes()}
        {StudentRoutes()}

        <Route path="/trial/exams/:id/take" element={wrap(<TakeExam />)} />

        <Route path="/trial" element={wrap(<TrialLayout />)}>
          <Route index element={wrap(<TrialDashboard />)} />
          <Route path="classes" element={wrap(<TrialClasses />)} />
          <Route path="courses/:id/learn" element={wrap(<TrialCourseLearn />)} />
          <Route path="recordings" element={wrap(<TrialRecordings />)} />
          <Route path="exams" element={wrap(<Exams />)} />
          <Route path="exams/:id" element={wrap(<ExamDetails />)} />
          <Route path="exams/:id/results/:submissionId" element={wrap(<ExamResult />)} />
          <Route path="flashcards" element={wrap(<StudentFlashcards />)} />
          <Route path="study-plan" element={wrap(<TrialStudyPlanPage />)} />
          <Route path="qna" element={wrap(<TrialQnaPage />)} />
          <Route path="progress" element={wrap(<TrialProgressPage />)} />
          <Route path="coursology-qbank" element={wrap(<CoursologyQbank />)} />
          <Route path="certificates" element={wrap(<TrialCertificatesPage />)} />
          <Route path="tickets" element={wrap(<TrialTicketsPage />)} />
          <Route path="settings" element={wrap(<TrialSettingsPage />)} />
          <Route path="locked/:feature" element={<RedirectLockedTrial />} />
          <Route path=":feature" element={wrap(<TrialMockFeature />)} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
      <TrialOfferModal />
      </MaintenanceGate>
    </BrowserRouter>
  );
}

export default App;
