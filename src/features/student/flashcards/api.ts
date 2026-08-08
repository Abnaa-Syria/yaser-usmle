import client from "../../../api/client";
import endpoints from "../../../api/endpoints";

export type FlashcardFilters = {
  courseId?: string;
  unitId?: string;
  lessonId?: string;
};

export async function fetchStudentFlashcards(filters: FlashcardFilters = {}) {
  const res = await client.get(endpoints.student.flashcards, { params: filters });
  return res?.data?.data ?? [];
}
