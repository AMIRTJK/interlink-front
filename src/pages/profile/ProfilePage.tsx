import { Profile } from "@features/profile";
import { LetterExecution } from "@features/ResolutionCard";
import { ResolutionOfLetter } from "@features/ResolutionOfLetter";
import { ModuleMenu } from "@widgets/layout";
import { Header } from "@widgets/layout/Header";

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
            
            <div className="flex flex-col gap-8 p-6 items-center">
                <div className="w-full">
                    <ResolutionOfLetter />
                </div>

                <div className="w-full flex flex-col items-center">
                    <LetterExecution />
                </div>
            </div>
        </div>
    );
};
