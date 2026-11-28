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
                ? "text-th-accent-600!"
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
            ? "border-th-accent-500! shadow-lg! shadow-th-accent-500/15!"
            : isDarkMode
              ? "bg-th-raised! border-th-high! text-white! hover:border-th-higher!"
              : "bg-white! border-gray-200! text-black! hover:border-th-accent-300!"
        }`}
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        allowClear
      />
    </div>
  );
};
