import { useOutletContext } from "react-router-dom";
import { Profile } from "@features/Profile";

export const ProfilePage = () => {
  const { currentTheme } = useOutletContext<{ currentTheme: string }>();

  return (
    <div className="mb-4">
      <Profile currentTheme={currentTheme} />
    </div>
  );
};
