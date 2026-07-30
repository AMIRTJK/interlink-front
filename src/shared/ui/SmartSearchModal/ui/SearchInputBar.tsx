import { Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";

interface ISearchInputBarProps {
  searchText: string;
  setSearchText: (text: string) => void;
  isSearchFocused: boolean;
  setIsSearchFocused: (focused: boolean) => void;
  isDarkMode?: boolean;
  placeholder?: string;
}

export const SearchInputBar = ({
  searchText,
  setSearchText,
  isSearchFocused,
  setIsSearchFocused,
  isDarkMode,
  placeholder = "Поиск...",
}: ISearchInputBarProps) => {
  return (
    <div className="py-4 w-full transition-all duration-300 ease-out transform">
      <Input
        size="large"
        placeholder={placeholder}
        prefix={
          <SearchOutlined
            className={`text-lg! mr-2! transition-colors! duration-300! ${
              isSearchFocused
                ? "text-blue-600!"
                : isDarkMode
                  ? "text-gray-500!"
                  : "text-gray-400!"
            }`}
          />
        }
        onFocus={() => setIsSearchFocused(true)}
        onBlur={() => setIsSearchFocused(false)}
        className={`w-full! h-12! rounded-2xl! border! text-base! shadow-sm! transition-all! duration-300! ${
          isSearchFocused
            ? "border-blue-500! shadow-lg! shadow-blue-500/15!"
            : isDarkMode
              ? "bg-gray-800! border-gray-700! text-white! hover:border-gray-600!"
              : "bg-white! border-gray-200! text-black! hover:border-blue-300!"
        }`}
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        allowClear
      />
    </div>
  );
};
