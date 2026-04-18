import { useQuery } from "@tanstack/react-query";
import { actorsControllerGetActorById } from "@/apis/api/actors";
import { directorsControllerGetDirectorById } from "@/apis/api/directors";
import { queryKeys } from "@/lib/query-keys";

export enum GENDER {
  MALE = "MALE",
  FEMALE = "FEMALE",
  OTHER = "OTHER",
}

export enum CONTENT_TYPE {
  MOVIE = "MOVIE",
  TVSERIES = "TVSERIES",
}

interface PersonContent {
  id: string;
  contentId: string;
  type: CONTENT_TYPE;
  title: string;
  description: string;
  thumbnail: string;
  releaseDate: Date;
  rating: number;
  duration?: string;
  character?: string;
}

interface PersonData {
  id: string;
  name: string;
  dateOfBirth: Date;
  gender: GENDER;
  bio: string;
  profilePicture: string;
  nationality: string;
  contents: PersonContent[];
  contentCount?: number;
  role: "actor" | "director";
}

interface UsePersonOptions {
  id: string;
}

async function fetchPerson(id: string): Promise<PersonData | null> {
  // Try to fetch from actors first
  try {
    const actorResponse = await actorsControllerGetActorById({ id });
    if (actorResponse?.data?.data) {
      return { ...actorResponse.data.data, role: "actor" } as PersonData;
    }
  } catch {
    // If actor not found, continue to try director
  }

  // If not found in actors, try directors
  const directorResponse = await directorsControllerGetDirectorById({ id });
  if (directorResponse?.data?.data) {
    return { ...directorResponse.data.data, role: "director" } as PersonData;
  }

  return null;
}

export function usePerson({ id }: UsePersonOptions) {
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.person.detail(id),
    queryFn: () => fetchPerson(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes — person data rarely changes
  });

  return {
    person: data ?? null,
    isLoading,
    error: error?.message ?? null,
  };
}
