import { lazy } from "react";
import { Navigate, Route, useParams } from "react-router-dom";
import AdminGuard from "./adminGuard";
import AdminLayout from "../layouts/AdminLayout";
import { AdminSuspense } from "../components/admin/AdminSuspense";
import RequirePermission from "../components/admin/RequirePermission";
import { platformFeatures } from "../config/features";
import useAuthStore from "../store/authStore";
import { hasPermission } from "../config/permissions";
import { getFirstAllowedAdminPath } from "../config/navigation";

const AdminOverview = lazy(() => import("../pages/admin/Overview"));
const AdminUsers = lazy(() => import("../pages/admin/Users"));
const AdminUserDetail = lazy(() => import("../pages/admin/UserDetail"));
const AdminInstructors = lazy(() => import("../pages/admin/Instructors"));
const AdminCourses = lazy(() => import("../pages/admin/Courses"));
const AdminExams = lazy(() => import("../pages/admin/Exams"));
const AdminFinance = lazy(() => import("../pages/admin/Finance"));
const AdminCms = lazy(() => import("../pages/admin/Cms"));
const AdminSettings = lazy(() => import("../pages/admin/Settings"));
const AdminAccount = lazy(() => import("../pages/admin/Account"));
const AdminTickets = lazy(() => import("../pages/admin/Tickets"));
const AdminTicketDetail = lazy(() => import("../pages/admin/TicketDetail"));
const AdminQna = lazy(() => import("../pages/admin/Qna"));
const AdminStudents = lazy(() => import("../pages/admin/Students"));
const AdminStudentDetail = lazy(() => import("../pages/admin/StudentDetail"));
const AdminInstructorsList = lazy(() => import("../pages/admin/InstructorsList"));
const AdminInstructorDetail = lazy(() => import("../pages/admin/InstructorDetail"));
const AdminInstructorPayouts = lazy(() => import("../pages/admin/InstructorPayouts"));
const AdminAddCourse = lazy(() => import("../pages/admin/AddCourse"));
const AdminCourseEditor = lazy(() => import("../pages/admin/CourseEditor"));
const AdminCourseCategories = lazy(() => import("../pages/admin/CourseCategories"));
const AdminEnrollments = lazy(() => import("../pages/admin/Enrollments"));
const AdminEnrollStudent = lazy(() => import("../pages/admin/EnrollStudent"));
const AdminCmsPosts = lazy(() => import("../pages/admin/CmsPosts"));
const AdminCmsBanners = lazy(() => import("../pages/admin/CmsBanners"));
const AdminCmsPages = lazy(() => import("../pages/admin/CmsPages"));
const AdminCmsHomeSections = lazy(() => import("../pages/admin/CmsHomeSections"));
const AdminMediaLibrary = lazy(() => import("../pages/shared/MediaLibraryPage"));
const AdminSettingsRoles = lazy(() => import("../pages/admin/SettingsRoles"));
const AdminRoleEditor = lazy(() => import("../pages/admin/RoleEditor"));
const AdminSettingsEmails = lazy(() => import("../pages/admin/SettingsEmails"));
const AdminSettingsIntegrations = lazy(() => import("../pages/admin/SettingsIntegrations"));
const AdminSettingsTrial = lazy(() => import("../pages/admin/SettingsTrial"));
const AdminDeviceReplacements = lazy(() => import("../pages/admin/DeviceReplacements"));
const AdminGamification = lazy(() => import("../pages/admin/Gamification"));
const AdminAddExam = lazy(() => import("../pages/admin/AddExam"));
const AdminExamEditor = lazy(() => import("../pages/admin/ExamEditor"));
const AdminExamSubmissions = lazy(() => import("../pages/admin/ExamSubmissions"));
const AdminPerformance = lazy(() => import("../pages/admin/Performance"));
const AdminCoupons = lazy(() => import("../pages/admin/Coupons"));
const AdminCertificates = lazy(() => import("../pages/admin/Certificates"));
const AdminPackages = lazy(() => import("../pages/admin/Packages"));
const AdminSubscriptions = lazy(() => import("../pages/admin/Subscriptions"));
const AdminReviewQueue = lazy(() => import("../pages/admin/ReviewQueue"));
const AdminAuditLogs = lazy(() => import("../pages/admin/AuditLogs"));
const AdminEvents = lazy(() => import("../pages/admin/Events"));
const AdminFlashcards = lazy(() => import("../pages/admin/Flashcards"));
const AdminInstructorApplications = lazy(() => import("../pages/admin/InstructorApplications"));
const AdminPrivateSessionRequests = lazy(() => import("../pages/admin/PrivateSessionRequests"));
const AdminResources = lazy(() => import("../pages/admin/Resources"));
const AdminReviews = lazy(() => import("../pages/admin/Reviews"));

function AdminCourseIdRedirect() {
  const { id } = useParams();
  return <Navigate to={`/admin/courses/${id}/edit`} replace />;
}

function wrap(node, permission, anyOf) {
  const inner = <AdminSuspense>{node}</AdminSuspense>;
  if (!permission && !anyOf?.length) return inner;
  return (
    <RequirePermission permission={permission} anyOf={anyOf}>
      {inner}
    </RequirePermission>
  );
}

function AdminHome() {
  const user = useAuthStore((s) => s.user);
  if (hasPermission(user, "dashboard:read")) {
    return wrap(<AdminOverview />, "dashboard:read");
  }
  const next = getFirstAllowedAdminPath((perm) => hasPermission(user, perm));
  if (next && next !== "/admin" && next !== "/admin/dashboard") {
    return <Navigate to={next} replace />;
  }
  return <Navigate to="/access-denied" replace />;
}

function AdminRoutes() {
  return (
    <Route element={<AdminGuard />}>
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminHome />} />
        <Route path="dashboard" element={<AdminHome />} />
        <Route path="finance" element={wrap(<AdminFinance />, "finance:manage")} />
        <Route path="performance" element={wrap(<AdminPerformance />, "dashboard:read")} />
        <Route path="coupons" element={wrap(<AdminCoupons />, "finance:manage")} />
        <Route path="packages" element={wrap(<AdminPackages />, "course:manage")} />
        <Route path="subscriptions" element={wrap(<AdminSubscriptions />, "finance:manage")} />
        <Route path="certificates" element={wrap(<AdminCertificates />, "course:manage")} />
        <Route
          path="events"
          element={platformFeatures.communityEvents ? wrap(<AdminEvents />, "event:manage") : <Navigate to="/access-denied" replace />}
        />
        <Route path="surveys" element={<Navigate to="/access-denied" replace />} />
        <Route path="live-sessions" element={<Navigate to="/access-denied" replace />} />

        <Route path="students" element={wrap(<AdminStudents />, "user:manage")} />
        <Route path="students/:id" element={wrap(<AdminStudentDetail />, "user:manage")} />

        <Route
          path="instructors/payouts"
          element={
            platformFeatures.multiInstructor && platformFeatures.wallet
              ? wrap(<AdminInstructorPayouts />, "payout:manage")
              : <Navigate to="/access-denied" replace />
          }
        />
        <Route
          path="instructors/list"
          element={
            platformFeatures.multiInstructor
              ? wrap(<AdminInstructorsList />, "instructor:manage")
              : <Navigate to="/admin/private-session-requests" replace />
          }
        />
        <Route
          path="instructors"
          element={
            platformFeatures.multiInstructor
              ? wrap(<AdminInstructors />, "instructor:manage")
              : <Navigate to="/admin/private-session-requests" replace />
          }
        />
        <Route
          path="instructors/:id"
          element={
            platformFeatures.multiInstructor
              ? wrap(<AdminInstructorDetail />, "instructor:manage")
              : <Navigate to="/admin/account" replace />
          }
        />
        <Route
          path="private-session-requests"
          element={
            platformFeatures.privateBooking
              ? wrap(<AdminPrivateSessionRequests />, "instructor:manage")
              : <Navigate to="/access-denied" replace />
          }
        />

        <Route path="courses" element={wrap(<AdminCourses />, undefined, ["course:manage", "course:review"])} />
        <Route path="courses/new" element={wrap(<AdminAddCourse />, "course:manage")} />
        <Route path="courses/review" element={wrap(<AdminReviewQueue />, "course:review")} />
        <Route path="courses/:id/edit" element={wrap(<AdminCourseEditor />, "course:manage")} />
        <Route path="courses/categories" element={wrap(<AdminCourseCategories />, "course:manage")} />
        <Route path="flashcards" element={wrap(<AdminFlashcards />, "flashcard:manage")} />
        <Route path="resources" element={wrap(<AdminResources />, "course:manage")} />
        <Route path="reviews" element={wrap(<AdminReviews />, "course:manage")} />
        <Route
          path="instructor-applications"
          element={platformFeatures.multiInstructor ? wrap(<AdminInstructorApplications />, "instructor_application:manage") : <Navigate to="/access-denied" replace />}
        />
        <Route path="courses/:id" element={wrap(<AdminCourseIdRedirect />, "course:manage")} />

        <Route path="enrollments" element={wrap(<AdminEnrollments />, "enrollment:manage")} />
        <Route path="enrollments/new" element={wrap(<AdminEnrollStudent />, "enrollment:manage")} />

        <Route path="tickets" element={wrap(<AdminTickets />, "support:manage")} />
        <Route path="tickets/:id" element={wrap(<AdminTicketDetail />, "support:manage")} />
        <Route path="qna" element={wrap(<AdminQna />, "support:manage")} />

        <Route path="cms/posts" element={wrap(<AdminCmsPosts />, "cms:manage")} />
        <Route path="cms/banners" element={wrap(<AdminCmsBanners />, "cms:manage")} />
        <Route path="cms/pages" element={wrap(<AdminCmsPages />, "cms:manage")} />
        <Route path="cms/home-sections" element={wrap(<AdminCmsHomeSections />, "cms:manage")} />
        <Route path="media" element={wrap(<AdminMediaLibrary />)} />

        <Route path="account" element={wrap(<AdminAccount />)} />
        <Route path="settings" element={wrap(<AdminSettings />, "settings:manage")} />
        <Route path="settings/roles/new" element={wrap(<AdminRoleEditor />, "role:manage")} />
        <Route path="settings/roles/:id/edit" element={wrap(<AdminRoleEditor />, "role:manage")} />
        <Route path="settings/roles" element={wrap(<AdminSettingsRoles />, "role:manage")} />
        <Route path="settings/emails" element={wrap(<AdminSettingsEmails />, "settings:manage")} />
        <Route path="settings/integrations" element={wrap(<AdminSettingsIntegrations />, "settings:manage")} />
        <Route path="settings/trial" element={wrap(<AdminSettingsTrial />, "settings:manage")} />
        <Route path="device-replacements" element={wrap(<AdminDeviceReplacements />, "user:manage")} />
        <Route path="gamification" element={wrap(<AdminGamification />, "settings:manage")} />
        <Route path="audit-logs" element={wrap(<AdminAuditLogs />, "audit:read")} />

        <Route path="users/:id" element={wrap(<AdminUserDetail />, "user:manage")} />
        <Route path="users" element={wrap(<AdminUsers />, "user:manage")} />
        <Route path="exams" element={wrap(<AdminExams />, "exam:manage")} />
        <Route path="exams/new" element={wrap(<AdminAddExam />, "exam:manage")} />
        <Route path="exams/:id/edit" element={wrap(<AdminExamEditor />, "exam:manage")} />
        <Route path="exams/:id/submissions" element={wrap(<AdminExamSubmissions />, "exam:manage")} />
        <Route path="cms" element={wrap(<AdminCms />, "cms:manage")} />
      </Route>
    </Route>
  );
}

export default AdminRoutes;
