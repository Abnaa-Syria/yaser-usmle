import { Navigate, Route } from "react-router-dom";
import { APP_ROLES } from "../config/permissions";
import { platformFeatures } from "../config/features";
import GuardedRoute from "./guardedRoute";
import InstructorLayout from "../layouts/InstructorLayout";
import InstructorOverview from "../pages/instructor/Overview";
import InstructorCourses from "../pages/instructor/Courses";
import InstructorCreateCourse from "../pages/instructor/CreateCourse";
import InstructorEditCourse from "../pages/instructor/EditCourse";
import InstructorExams from "../pages/instructor/Exams";
import InstructorExamDetailPage from "../pages/instructor/ExamDetail";
import InstructorStudents from "../pages/instructor/Students";
import InstructorStudentDetail from "../pages/instructor/StudentDetail";
import InstructorQna from "../pages/instructor/Qna";
import InstructorWallet from "../pages/instructor/Wallet";
import InstructorPerformance from "../pages/instructor/Performance";
import InstructorAvailability from "../pages/instructor/Availability";
import InstructorSettings from "../pages/instructor/Settings";

function InstructorRoutes() {
  if (!platformFeatures.instructorSelfService) {
    return <Route path="/instructor/*" element={<Navigate to="/access-denied" replace />} />;
  }

  return (
    <Route element={<GuardedRoute allowedRoles={[APP_ROLES.INSTRUCTOR]} />}>
      <Route path="/instructor" element={<InstructorLayout />}>
        <Route index element={<Navigate to="/instructor/dashboard" replace />} />
        <Route path="dashboard" element={<InstructorOverview />} />
        <Route path="classes" element={<Navigate to="/instructor/courses" replace />} />
        <Route path="cohorts" element={<Navigate to="/instructor/courses" replace />} />
        <Route path="courses" element={<InstructorCourses />} />
        <Route path="courses/new" element={<InstructorCreateCourse />} />
        <Route path="courses/:id/edit" element={<InstructorEditCourse />} />
        <Route path="homework" element={<Navigate to="/instructor/exams" replace />} />
        <Route path="live-sessions" element={<Navigate to="/access-denied" replace />} />
        <Route
          path="availability"
          element={<Navigate to="/access-denied" replace />}
        />
        <Route path="attendance" element={<Navigate to="/access-denied" replace />} />
        <Route path="exams" element={<InstructorExams />} />
        <Route path="exams/:examId" element={<InstructorExamDetailPage />} />
        <Route path="students" element={<InstructorStudents />} />
        <Route path="students/:id" element={<InstructorStudentDetail />} />
        <Route path="qna" element={<InstructorQna />} />
        <Route
          path="wallet"
          element={platformFeatures.wallet ? <InstructorWallet /> : <Navigate to="/access-denied" replace />}
        />
        <Route path="performance" element={<InstructorPerformance />} />
        <Route path="settings" element={<InstructorSettings />} />
      </Route>
    </Route>
  );
}

export default InstructorRoutes;
