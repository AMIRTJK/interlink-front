import { Form, Select } from "antd";
import FlagTJK from "../../assets/icons/flag-tjk.svg";

const countries = [
  { code: "+992", name: "TJ", flag: FlagTJK },
  { code: "+7", name: "RU", flag: "https://flagcdn.com/w20/ru.png" },
  { code: "+380", name: "UA", flag: "https://flagcdn.com/w20/ua.png" },
  { code: "+1", name: "US", flag: "https://flagcdn.com/w20/us.png" },
];

export const selectBefore = (
  <Form.Item name="prefix" noStyle initialValue="+992">
    <Select
      variant="borderless"
      style={{ width: 100 }}
      dropdownStyle={{ minWidth: 150 }}
    >
      {countries.map((c) => (
        <Select.Option key={c.code} value={c.code}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <img
              src={c.flag}
              alt={c.name}
              style={{ width: 18, borderRadius: 2 }}
            />
            <span>{c.code}</span>
          </div>
        </Select.Option>
      ))}
    </Select>
  </Form.Item>
);
