import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { bookAvailabilitySlot, fetchAvailableSlots } from "./api";

export function useAvailableBookingSlots(limit = 100) {
  return useQuery({
    queryKey: ["student", "booking-slots", limit],
    queryFn: () => fetchAvailableSlots(limit),
    retry: false,
  });
}

export function useBookSlot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (availabilityId: string) => bookAvailabilitySlot(availabilityId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["student", "booking-slots"] });
    },
  });
}
