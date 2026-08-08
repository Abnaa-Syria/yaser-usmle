import { lazy } from "react";
import { Navigate, Route, useLocation, useParams } from "react-router-dom";
import { APP_ROLES } from "../config/permissions";
import { platformFeatures } from "../config/features";
import GuardedRoute from "./guardedRoute";
import { RouteSuspense } from "../components/LoadingFallback";
import StudentLayout from "../layouts/StudentLayout";

const StudentOverview = lazy(() => import("../pages/student/Overview"));
const MyClasses = lazy(() => import("../pages/MyClasses"));
const RecordingsLibrary = lazy(() => import("../pages/student/RecordingsLibrary"));
const RecordingPlayer = lazy(() => import("../pages/student/RecordingPlayer"));
const Exams = lazy(() => import("../pages/Exams"));
const ExamDetails = lazy(() => import("../pages/ExamDetails"));
const TakeExam = lazy(() => import("../pages/TakeExam"));
const ExamResult = lazy(() => import("../pages/ExamResult"));
const Progress = lazy(() => import("../pages/Progress"));
const Payments = lazy(() => import("../pages/student/Payments"));
const Certificates = lazy(() => import("../pages/student/Certificates"));
const Tickets = lazy(() => import("../pages/student/Tickets"));
const TicketDetail = lazy(() => import("../pages/student/TicketDetail"));
const Checkout = lazy(() => import("../pages/Checkout"));
const Settings = lazy(() => import("../pages/Settings"));
const Wishlist = lazy(() => import("../pages/student/Wishlist"));
const CourseView = lazy(() => import("../pages/CourseView"));
const StudentQna = lazy(() => import("../pages/student/Qna"));
const StudentFlashcards = lazy(() => import("../pages/student/Flashcards"));
const StudentStudyPlan = lazy(() => import("../pages/student/StudyPlan"));

function wrap(node) {
  return <RouteSuspense>{node}</RouteSuspense>;
}

function RedirectCourseLearn() {
  const { id } = useParams();
  return <Navigate to={`/student/courses/${id}/learn`} replace />;
}

function RedirectExamsPath() {
  const location = useLocation();
  const suffix = location.pathname.replace(/^\/exams/, "") || "";
  return <Navigate to={`/student/exams${suffix}${location.search}`} replace />;
}

function RedirectCheckoutPath() {
  const location = useLocation();
  return <Navigate to={`/student/checkout${location.search}`} replace />;
}

function StudentRoutes() {
  return (
    <>
      <Route element={<GuardedRoute allowedRoles={[APP_ROLES.STUDENT]} />}>
        <Route path="/student/courses/:id/learn" element={wrap(<CourseView />)} />
        <Route path="/student/exams/:id/take" element={wrap(<TakeExam />)} />

        <Route path="/student" element={<StudentLayout />}>
          <Route index element={wrap(<StudentOverview />)} />
          <Route path="classes" element={wrap(<MyClasses />)} />
          <Route path="live-sessions" element={<Navigate to="/student/classes" replace />} />
          <Route path="live-sessions/:id" element={<Navigate to="/student/classes" replace />} />
          <Route path="recordings" element={wrap(<RecordingsLibrary />)} />
          <Route path="recordings/:sourceType/:id" element={wrap(<RecordingPlayer />)} />
          <Route path="homework" element={<Navigate to="/student/exams" replace />} />
          <Route path="homework/*" element={<Navigate to="/student/exams" replace />} />
          <Route path="exams" element={wrap(<Exams />)} />
          <Route path="exams/:id" element={wrap(<ExamDetails />)} />
          <Route path="exams/:id/results/:submissionId" element={wrap(<ExamResult />)} />
          <Route path="flashcards" element={wrap(<StudentFlashcards />)} />
          <Route path="study-plan" element={wrap(<StudentStudyPlan />)} />
          <Route path="progress" element={wrap(<Progress />)} />
          <Route path="attendance" element={<Navigate to="/student/classes" replace />} />
          <Route
            path="book-session"
            element={
              platformFeatures.privateBooking ? (
                <Navigate to="/instructors/platform-owner#book" replace />
              ) : (
                <Navigate to="/teach" replace />
              )
            }
          />
          <Route path="payments" element={wrap(<Payments />)} />
          <Route path="certificates" element={wrap(<Certificates />)} />
          <Route path="tickets" element={wrap(<Tickets />)} />
          <Route path="tickets/:id" element={wrap(<TicketDetail />)} />
          <Route path="checkout" element={wrap(<Checkout />)} />
          <Route path="settings" element={wrap(<Settings />)} />
          <Route path="wishlist" element={wrap(<Wishlist />)} />
          <Route path="qna" element={wrap(<StudentQna />)} />
        </Route>
      </Route>

      {/* Legacy path redirects */}
      <Route path="/my-classes" element={<Navigate to="/student/classes" replace />} />
      <Route path="/course/:id" element={<RedirectCourseLearn />} />
      <Route path="/homework" element={<Navigate to="/student/exams" replace />} />
      <Route path="/homework/*" element={<Navigate to="/student/exams" replace />} />
      <Route path="/exams/*" element={<RedirectExamsPath />} />
      <Route path="/progress" element={<Navigate to="/student/progress" replace />} />
      <Route path="/settings" element={<Navigate to="/student/settings" replace />} />
      <Route path="/recordings" element={<Navigate to="/student/recordings" replace />} />
      <Route path="/checkout" element={<RedirectCheckoutPath />} />
      <Route path="/book-session" element={<Navigate to="/teach" replace />} />
    </>
  );
}

export default StudentRoutes;
