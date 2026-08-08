import { useLocation } from "react-router-dom";

/** Detect student vs trial exam/flashcard panel from the URL. */
export function useLearningPanelMode() {
  const { pathname } = useLocation();
  const isTrial = pathname.startsWith("/trial");
  return {
    isTrial,
    examsBase: isTrial ? "/trial/exams" : "/student/exams",
    flashcardsBase: isTrial ? "/trial/flashcards" : "/student/flashcards",
  };
}
