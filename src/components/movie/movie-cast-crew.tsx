"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, UserCog } from "lucide-react";

interface Person {
  id?: number;
  name: string;
  role?: string;
  image?: string;
}

interface MovieCastCrewProps {
  cast: Person[];
  crew: Person[];
}

export function MovieCastCrew({ cast, crew }: MovieCastCrewProps) {
  return (
    <div className="grid md:grid-cols-2 gap-8">
      {/* Cast */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-6 h-6 text-orange-500" />
          <h3 className="text-2xl font-bold text-white">Cast</h3>
        </div>
        <div className="space-y-3">
          {cast.map((person, index) => {
            const content = (
              <>
                <Avatar className="w-12 h-12">
                  <AvatarImage src={person.image} alt={person.name} />
                  <AvatarFallback className="bg-orange-500 text-white">
                    {person.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-white font-medium">{person.name}</p>
                  {person.role && (
                    <p className="text-sm text-gray-400">{person.role}</p>
                  )}
                </div>
              </>
            );

            return person.id ? (
              <Link
                key={index}
                href={`/person/${person.id}`}
                className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                {content}
              </Link>
            ) : (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors"
              >
                {content}
              </div>
            );
          })}
        </div>
      </div>

      {/* Crew */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <UserCog className="w-6 h-6 text-orange-500" />
          <h3 className="text-2xl font-bold text-white">Crew</h3>
        </div>
        <div className="space-y-3">
          {crew.map((person, index) => {
            const content = (
              <>
                <Avatar className="w-12 h-12">
                  <AvatarImage src={person.image} alt={person.name} />
                  <AvatarFallback className="bg-purple-500 text-white">
                    {person.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-white font-medium">{person.name}</p>
                  {person.role && (
                    <p className="text-sm text-gray-400">{person.role}</p>
                  )}
                </div>
              </>
            );

            return person.id ? (
              <Link
                key={index}
                href={`/person/${person.id}`}
                className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                {content}
              </Link>
            ) : (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors"
              >
                {content}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
