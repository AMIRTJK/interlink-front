import { Profile } from "@features/profile";
import { ModuleMenu } from "@widgets/layout";
import { Header } from "@widgets/layout/Header";
import { LetterExecution } from "@features/ResolutionCard";
// import { DetailsOfLetter } from "@features/detailsOfLetter/DetailsOfLetter";
// import { ResolutionOfLetter } from "@features/ResolutionOfLetter";
export const ProfilePage = () => {
    return (
        <div className="bg-[#e5e9f5] h-screen overflow-auto">
            <div className="p-6">
                <Header />
            </div>
            <div className="p-2">
                <ModuleMenu />
            </div>
            <div className="main-content-area bg-[#e5e9f5] mb-4">
                <Profile />
            </div>
            {/* <div className="flex flex-col gap-8 p-6 items-center">
                <ResolutionOfLetter />
                <DetailsOfLetter mode="create" />
                <LetterExecution />
            </div> */}
        </div>
    );
};
