import { useState, useEffect } from "react";
import { actorControllerGetTopActors } from "@/apis/api/actors";

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
  const [actors, setActors] = useState<Actor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopActors = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await actorControllerGetTopActors({
          limit,
        });

        if (response?.data?.data) {
          setActors(response.data.data);
        }
      } catch (err: any) {
        console.error("Error fetching top actors:", err);
        setError(err?.message || "Failed to fetch top actors");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopActors();
  }, [limit]);

  return {
    actors,
    isLoading,
    error,
  };
}
