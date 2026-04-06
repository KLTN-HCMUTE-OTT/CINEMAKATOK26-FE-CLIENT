"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PersonInfoSidebarProps {
  knownFor?: string;
  gender?: string;
  birthday?: string;
  placeOfBirth?: string;
  alsoKnownAs?: string[];
}

export function PersonInfoSidebar({
  knownFor = "Acting",
  gender = "female",
  birthday = "June 16, 1983",
  placeOfBirth = "Japan",
  alsoKnownAs = ["John Witch"],
}: PersonInfoSidebarProps) {
  return (
    <Card className="bg-gray-900/50 border-0">
      <CardHeader>
        <CardTitle className="text-white text-lg">Personal Info</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-400 mb-1">
            Known for
          </h3>
          <p className="text-white">{knownFor}</p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-400 mb-1">Gender</h3>
          <p className="text-white capitalize">{gender}</p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-400 mb-1">Birthday</h3>
          <p className="text-white">{birthday}</p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-400 mb-1">
            Place of Birth
          </h3>
          <p className="text-white">{placeOfBirth}</p>
        </div>

        {alsoKnownAs && alsoKnownAs.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-400 mb-1">
              Also Known As
            </h3>
            <div className="space-y-1">
              {alsoKnownAs.map((name, index) => (
                <p key={index} className="text-white text-sm">
                  {name}
                </p>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
