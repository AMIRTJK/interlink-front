import { Form, Select } from "antd";
import FlagTJK from "../../assets/icons/flag-tjk.svg";
import ArrowBottomSuffix from "../../assets/icons/arrow-bottom-suffix.svg";

const countries = [
  { code: "+992", name: "TJ", flag: FlagTJK },
];

export const selectBefore = (
  <Form.Item name="prefix" noStyle initialValue="+992">
    <Select
      variant="borderless"
      style={{ width: 120 }}
      dropdownStyle={{ minWidth: 150 }}
      suffixIcon={<img src={ArrowBottomSuffix} />}
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
