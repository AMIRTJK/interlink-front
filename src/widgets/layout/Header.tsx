import { Link } from "react-router-dom";
import { ThemeSwitcher } from "@features/theme/ThemeSwitcher";
import { Typography } from "antd";
import { ROUTES } from "@shared/config/routes";

const { Title } = Typography;

export const Header = () => {
    return (
        <header className="header">
            <div className="header-content">
                <div className="flex items-center gap-8">
                    <Link to="/" className="nav-link">
                        <Title level={4} style={{ margin: 0, color: "var(--color-text-primary)" }}>
                            Interlink
                        </Title>
                    </Link>
                    <nav className="hidden md:flex gap-6">
                        <Link to={ROUTES.PROFILE} className="nav-link">
                            Profile
                        </Link>
                    </nav>
                </div>
                <div className="flex items-center gap-4">
                    <ThemeSwitcher />
                </div>
            </div>
        </header>
    );
};
