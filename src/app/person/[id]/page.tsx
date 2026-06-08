"use client";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import {
  PersonHero,
  PersonInfoSidebar,
  PersonFilmography,
} from "@/components/person";
import { usePerson, GENDER, CONTENT_TYPE } from "@/hooks/use-person";
import { use, useState } from "react";

interface PersonPageProps {
  params: Promise<{ id: string }>;
}

export default function PersonPage({ params }: PersonPageProps) {
  const { id } = use(params);
  const { person, isLoading, error } = usePerson({ id });
  const [imageError, setImageError] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black">
        <Header variant="relative" />
        <main className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-white text-xl">Loading...</div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !person) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black">
        <Header variant="relative" />
        <main className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-red-400 text-xl">
              {error || "Person not found"}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Format date for display
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };
  // Transform contents to movie format for PersonFilmography
  const movies = person.contents.map((content) => ({
    id: content.id,
    contentId: content.contentId,
    title: content.title,
    year: new Date(content.releaseDate).getFullYear(),
    image: content.thumbnail,
    description: content.description,
    duration: content.duration,
    character: content.character,
    job: person.role === "director" ? "Director" : undefined,
    type:
      content.type === CONTENT_TYPE.MOVIE
        ? ("movie" as const)
        : ("tv" as const),
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black">
      <Header variant="relative" />

      <main className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Sidebar - Image and Personal Info */}
          <aside className="lg:col-span-3">
            <div className="space-y-6">
              {/* Profile Image */}
              <div className="w-full aspect-[3/4] rounded-lg overflow-hidden shadow-2xl">
                <div className="relative w-full h-full bg-gray-800">
                  {!imageError && person.profilePicture ? (
                    <img
                      src={person.profilePicture}
                      alt={person.name}
                      className="w-full h-full object-cover"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-blue-500">
                      <div className="text-white text-6xl font-bold">
                        {person.name.charAt(0).toUpperCase()}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Social Links (Optional) */}
              <div className="flex gap-3 justify-center"></div>

              {/* Personal Info */}
              <PersonInfoSidebar
                knownFor={person.role === "actor" ? "Acting" : "Directing"}
                gender={person?.gender?.toLowerCase() || "Not specified"}
                birthday={formatDate(person?.dateOfBirth) || "Unknown"}
                placeOfBirth={person.nationality}
                alsoKnownAs={[]}
              />
            </div>
          </aside>

          {/* Right Content - Biography and Filmography */}
          <div className="lg:col-span-9">
            <div className="space-y-8">
              {/* Name and Biography */}
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                  {person.name}
                </h1>
                <PersonHero
                  name={person.name}
                  profileImage={person.profilePicture}
                  biography={person.bio}
                />
              </div>

              {/* Filmography */}
              <PersonFilmography movies={movies} name={person.name} />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
