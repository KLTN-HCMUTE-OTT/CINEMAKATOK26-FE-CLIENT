import { useQuery } from "@tanstack/react-query";
import { actorsControllerGetTopActors } from "@/apis/api/actors";
import { queryKeys } from "@/lib/query-keys";

interface Actor {
  id: string;
  name: string;
  profilePicture: string;
  contentCount?: number;
}

interface UseTopActorsOptions {
  limit?: number;
}

export function useTopActors(options: UseTopActorsOptions = {}) {
  const { limit = 10 } = options;

  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.actors.top(limit),
    queryFn: async () => {
      const response = await actorsControllerGetTopActors({ limit });
      return (response?.data?.data ?? []) as Actor[];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  return {
    actors: data ?? [],
    isLoading,
    error: error?.message ?? null,
  };
}
