import { Tooltip } from "antd";
import { SunOutlined, MoonOutlined, RocketOutlined } from "@ant-design/icons";
import { useTheme, type Theme } from "@app/providers/ThemeProvider";

type ThemeOption = {
    key: Theme;
    icon: React.ReactNode;
    label: string;
};

export const ThemeSwitcher = () => {
    const { theme, setTheme } = useTheme();

    const themes: ThemeOption[] = [
        { key: "light", icon: <SunOutlined style={{ color: "#fff" }} />, label: "Светлая" },
        { key: "dark", icon: <MoonOutlined style={{ color: "#333" }} />, label: "Тёмная" },
        { key: "space", icon: <RocketOutlined style={{ color: "#333" }} />, label: "Космос" },
    ];

    return (
        <div className="theme-switcher">
            {themes?.map((item) => (
                <Tooltip key={item.key} title={item.label} placement="bottom">
                    <button
                        className={`theme-btn ${theme === item.key ? "active" : ""}`}
                        onClick={() => setTheme(item.key)}
                        aria-label={item.label}
                    >
                        {item.icon}
                    </button>
                </Tooltip>
            ))}
        </div>
    );
};
