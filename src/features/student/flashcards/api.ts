import client from "../../../api/client";
import endpoints from "../../../api/endpoints";

export type FlashcardFilters = {
  courseId?: string;
  unitId?: string;
  lessonId?: string;
  dueOnly?: boolean;
};

export type FlashcardDifficulty = "EASY" | "MEDIUM" | "HARD";

export async function fetchStudentFlashcards(filters: FlashcardFilters = {}) {
  const res = await client.get(endpoints.student.flashcards, {
    params: {
      ...filters,
      dueOnly: filters.dueOnly === false ? "false" : "true",
    },
  });
  return res?.data?.data ?? [];
}

export async function reviewStudentFlashcard(id: string, difficulty: FlashcardDifficulty) {
  const res = await client.post(endpoints.student.flashcardReview(id), { difficulty });
  return res?.data?.data ?? null;
}

export async function fetchFlashcardIntervals() {
  const res = await client.get(endpoints.student.flashcardIntervals);
  return res?.data?.data ?? { EASY: 30, MEDIUM: 7, HARD: 3 };
}

export async function fetchMyFlashcards(filters: FlashcardFilters = {}) {
  const res = await client.get(endpoints.student.myFlashcards, {
    params: {
      ...filters,
      ...(filters.dueOnly === true ? { dueOnly: "true" } : { dueOnly: "false" }),
    },
  });
  return res?.data?.data ?? [];
}

export async function createMyFlashcard(body: Record<string, unknown>) {
  const res = await client.post(endpoints.student.myFlashcards, body);
  return res?.data?.data ?? null;
}

export async function updateMyFlashcard(id: string, body: Record<string, unknown>) {
  const res = await client.patch(endpoints.student.myFlashcard(id), body);
  return res?.data?.data ?? null;
}

export async function deleteMyFlashcard(id: string) {
  const res = await client.delete(endpoints.student.myFlashcard(id));
  return res?.data?.data ?? null;
}

export async function reviewMyFlashcard(id: string, difficulty: FlashcardDifficulty) {
  const res = await client.post(endpoints.student.myFlashcardReview(id), { difficulty });
  return res?.data?.data ?? null;
}
