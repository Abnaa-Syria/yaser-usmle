export const students = Array.from({ length: 12 }).map((_, i) => ({
  id: `std-${i + 1}`,
  name: ["Ahmed Hassan", "Sara Ali", "Mariam Adel", "Omar Tarek"][i % 4] + ` ${i + 1}`,
  email: `student${i + 1}@yaserusmle.com`,
  enrolledCourses: (i % 5) + 1,
  joinDate: `2026-04-${String((i % 28) + 1).padStart(2, "0")}`,
  status: ["Active", "Inactive", "Banned"][i % 3],
  spent: 120 + i * 15,
  lastLogin: "2h ago",
}));

export const instructors = Array.from({ length: 8 }).map((_, i) => ({
  id: `ins-${i + 1}`,
  name: ["Dr. Lina Hassan", "Dr. Mona Salem", "Dr. Karim Fathy", "Dr. Nora Emad"][i % 4],
  email: `instructor${i + 1}@yaserusmle.com`,
  coursesCount: (i % 4) + 2,
  totalStudents: 120 + i * 19,
  rating: 4.2 + (i % 3) * 0.2,
  revenue: 1200 + i * 350,
  status: ["Active", "Suspended"][i % 2],
  bio: "Experienced medical educator focused on integrated USMLE Step 1 preparation.",
}));

export const payouts = Array.from({ length: 6 }).map((_, i) => ({
  id: `pay-${i + 1}`,
  instructor: instructors[i % instructors.length].name,
  amount: 350 + i * 120,
  period: `2026-${String((i % 4) + 1).padStart(2, "0")}`,
  status: ["Paid", "Pending", "Processing"][i % 3],
  date: `2026-04-${String(20 + i).padStart(2, "0")}`,
}));

export const courses = Array.from({ length: 10 }).map((_, i) => ({
  id: `course-${i + 1}`,
  title: ["Cardiovascular Review", "Renal & Acid–Base", "Immunology Essentials", "General Pathology"][i % 4] + ` ${i + 1}`,
  instructor: instructors[i % instructors.length].name,
  category: ["Organ Systems", "Basic Sciences", "Pathology", "Pharmacology"][i % 4],
  price: 99 + i * 20,
  students: 40 + i * 12,
  rating: 4 + (i % 4) * 0.2,
  status: ["Published", "Draft", "Archived"][i % 3],
  progress: 20 + i * 7,
}));

export const categories = [
  { id: "cat-1", name: "Organ Systems", icon: "🫀", color: "#3B82F6", count: 12 },
  { id: "cat-2", name: "Basic Sciences", icon: "🧬", color: "#8B5CF6", count: 7 },
  { id: "cat-3", name: "Pathology", icon: "🔬", color: "#F59E0B", count: 9 },
  { id: "cat-4", name: "Pharmacology", icon: "💊", color: "#10B981", count: 6 },
];

export const enrollments = Array.from({ length: 14 }).map((_, i) => ({
  id: `enr-${i + 1}`,
  student: students[i % students.length].name,
  course: courses[i % courses.length].title,
  instructor: courses[i % courses.length].instructor,
  enrolledDate: `2026-04-${String((i % 28) + 1).padStart(2, "0")}`,
  progress: 10 + (i % 9) * 10,
  status: ["Active", "Completed", "Paused"][i % 3],
  pricePaid: courses[i % courses.length].price,
}));

