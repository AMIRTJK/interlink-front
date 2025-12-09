import { Button, Dropdown, type MenuProps } from "antd";
import { BgColorsOutlined } from "@ant-design/icons";
import { useTheme } from "@app/providers/ThemeProvider";

export const ThemeSwitcher = () => {
    const { setTheme } = useTheme();

    const items: MenuProps["items"] = [
        { key: "light", label: "Light Theme", onClick: () => setTheme("light") },
        { key: "dark", label: "Dark Theme", onClick: () => setTheme("dark") },
        { key: "space", label: "Space Theme", onClick: () => setTheme("space") },
    ];

    return (
        <Dropdown menu={{ items }} placement="bottomRight" arrow>
            <Button
                shape="circle"
                icon={<BgColorsOutlined />}
                size="large"
                className="theme-switcher-btn"
            />
        </Dropdown>
    );
};
