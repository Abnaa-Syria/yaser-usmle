import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteMediaAsset, fetchMediaLibrary, uploadMediaFile } from "./api";

export function useMediaLibrary(params = {}, options = {}) {
  return useQuery({
    queryKey: ["media", "library", params],
    queryFn: () => fetchMediaLibrary(params),
    staleTime: 30 * 1000,
    ...options,
  });
}

export function useUploadMedia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: uploadMediaFile,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["media", "library"] });
    },
  });
}

export function useDeleteMedia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteMediaAsset,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["media", "library"] });
    },
  });
}
