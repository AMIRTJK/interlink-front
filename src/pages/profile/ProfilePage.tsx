import { Profile } from "@features/profile";
import { ResolutionOfLetter } from "@features/ResolutionOfLetter";
import { ResolutionCard } from "@features/ResolutionCard";
import { ModuleMenu } from "@widgets/layout";
import { Header } from "@widgets/layout/Header";

export const ProfilePage = () => {
    const mockCardData = {
        position: "ЗАМЕСТИТЕЛЬ МИНИСТРА ФИНАНСОВ",
        name: "Алишер Кишвар",
        content: "test",
        deadline: "24.12.2025",
        status: "Фаври",
        signature: {
            certId: "TestCertId",
            owner: "Сарвар Курбонийон",
            date: "24.12.2025",
            validity: "аз 24.12.2025 то 24.12.2026"
        },
        footerName: "Сарвар Курбонийон",
        footerDate: {
            day: "24",
            month: "12",
            year: "2025"
        }
    };

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
                    <h2 className="mb-4 text-xl font-bold">Original ResolutionOfLetter:</h2>
                    <ResolutionOfLetter />
                </div>

                <div className="w-full flex flex-col items-center">
                    <ResolutionCard {...mockCardData} />
                </div>
            </div>
        </div>
    );
};
