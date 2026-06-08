import { Eye } from "lucide-react";

declare module "lucide-react" {
  import * as React from "react";

  // Common icons used in this project — add more as needed
  export const OctagonAlert: React.FC<React.SVGProps<SVGSVGElement>>;
  export const Plus: React.FC<React.SVGProps<SVGSVGElement>>;
  export const Bookmark: React.FC<React.SVGProps<SVGSVGElement>>;
  export const Volume2: React.FC<React.SVGProps<SVGSVGElement>>;
  export const VolumeX: React.FC<React.SVGProps<SVGSVGElement>>;
  export const Maximize2: React.FC<React.SVGProps<SVGSVGElement>>;
  export const Info: React.FC<React.SVGProps<SVGSVGElement>>;
  export const Search: React.FC<React.SVGProps<SVGSVGElement>>;
  export const Globe: React.FC<React.SVGProps<SVGSVGElement>>;
  export const ChevronDown: React.FC<React.SVGProps<SVGSVGElement>>;
  export const ChevronDownIcon: React.FC<React.SVGProps<SVGSVGElement>>;
  export const ChevronRightIcon: React.FC<React.SVGProps<SVGSVGElement>>;
  export const Play: React.FC<React.SVGProps<SVGSVGElement>>;
  export const User: React.FC<React.SVGProps<SVGSVGElement>>;
  export const CheckIcon: React.FC<React.SVGProps<SVGSVGElement>>;
  export const CircleIcon: React.FC<React.SVGProps<SVGSVGElement>>;
  export const Star: React.FC<React.SVGProps<SVGSVGElement>>;
  export const Clock: React.FC<React.SVGProps<SVGSVGElement>>;
  export const ChevronLeft: React.FC<React.SVGProps<SVGSVGElement>>;
  export const ChevronRight: React.FC<React.SVGProps<SVGSVGElement>>;
  export const Menu: React.FC<React.SVGProps<SVGSVGElement>>;
  export const X: React.FC<React.SVGProps<SVGSVGElement>>;
  export const Eye: React.FC<React.SVGProps<SVGSVGElement>>;

  // Generic fallback for any other icon imports
  const Icon: React.FC<React.SVGProps<SVGSVGElement>>;
  export default Icon;
}
