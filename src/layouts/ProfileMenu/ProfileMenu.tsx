import { useState } from "react";
import { useAuthContext } from "@/shared/context/AuthContext";
import { useUserProfileQuery } from "@/features/auth/hooks/useUserProfileQuery";
import { DropdownMenu, DropdownMenuContent } from "@/components/common/DropdownMenu";
import { ProfileMenuContent } from "./ProfileMenuContent";
import { ProfileMenuTrigger } from "./ProfileMenuTrigger";

/** Top-bar menu. It holds only the color mode toggle: the breathwork app needs no account. */
export const ProfileMenu = () => {
  const { user } = useAuthContext();
  const { data: profile } = useUserProfileQuery(user?.id ?? null);
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <ProfileMenuTrigger user={user} profile={profile ?? null} />
      <DropdownMenuContent id="account-menu" align="end" className="w-[240px] max-w-[280px]">
        <ProfileMenuContent />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
