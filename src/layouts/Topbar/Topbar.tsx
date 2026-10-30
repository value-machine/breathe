import { Link } from "react-router-dom";
import { ProfileMenu } from "@/layouts/ProfileMenu";

/**
 * Topbar component that is always visible.
 * This component is designed to be reusable across all apps.
 */
export const Topbar = () => {
  return (
    <header className="fixed inset-x-0 top-0 z-40 bg-background/80 text-foreground backdrop-blur-md">
      <div className="flex h-toolbar items-center px-4 sm:px-6">
        <div className="flex-1 font-heading text-xl font-medium">
          <Link to="/" className="text-primary no-underline">
            Breathe
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <ProfileMenu />
        </div>
      </div>
    </header>
  );
};
