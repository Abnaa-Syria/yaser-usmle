import DashboardLayout from "./DashboardLayout";
import { getInstructorNavigation } from "../config/navigation";

function InstructorLayout() {
  return <DashboardLayout sidebarSections={getInstructorNavigation()} />;
}

export default InstructorLayout;
