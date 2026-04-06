import { useState, useEffect } from "react";
import { actorControllerFindOne } from "@/apis/api/actors";
import { directorControllerFindOne } from "@/apis/api/directors";

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
  character?: string; // For actors
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
  role: "actor" | "director"; // To distinguish between actor and director
}

interface UsePersonOptions {
  id: string;
}

export function usePerson({ id }: UsePersonOptions) {
  const [person, setPerson] = useState<PersonData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPerson = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Try to fetch from actors first
        try {
          const actorResponse = await actorControllerFindOne({
            id,
          });

          if (actorResponse?.data?.data) {
            const actorData = actorResponse.data.data;
            setPerson({
              ...actorData,
              role: "actor",
            });
            return;
          }
        } catch (actorError) {
          // If actor not found, continue to try director
          console.log("Not found in actors, trying directors...");
        }

        // If not found in actors, try directors
        const directorResponse = await directorControllerFindOne({
          id,
        });

        if (directorResponse?.data?.data) {
          const directorData = directorResponse.data.data;
          setPerson({
            ...directorData,
            role: "director",
          });
        } else {
          setError("Person not found");
        }
      } catch (err: any) {
        console.error("Error fetching person:", err);
        setError(err?.message || "Failed to fetch person data");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchPerson();
    }
  }, [id]);

  return {
    person,
    isLoading,
    error,
  };
}
