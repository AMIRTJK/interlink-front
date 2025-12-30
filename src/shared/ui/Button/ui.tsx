import { Button as ButtonAntd } from "antd";
import { ReactNode } from "react";

interface ButtonProps {
  type: "primary" | "default" | "dashed" | "link" | "text";
  text?: string;
  htmlType?: "button" | "submit" | "reset";
  withIcon?: boolean;
  icon?: React.ReactNode | string;
  style?: { [key: string]: string };
  onClick?: () => void;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  antdIcon?: React.ReactNode;
  block?: boolean;
}

const If = ({ is, children }: { is: boolean; children: ReactNode }) =>
  is ? <>{children}</> : null;

export const Button = ({
  text,
  withIcon,
  icon,
  antdIcon,
  block,
  ...props
}: ButtonProps) => {
  const renderIcon = () => {
    if (!withIcon) return undefined;
    if (typeof icon === "string") {
      return (
        <img
          src={icon}
          alt="button-icon"
          style={{ width: "24px", height: "24px" }}
          className="block mx-auto"
        />
      );
    }
    return icon;
  };

  const finalIcon = renderIcon() || antdIcon;

  return (
    <ButtonAntd {...props} block={block} icon={finalIcon}>
      {text ? <span className="ml-2">{text}</span> : null}
    </ButtonAntd>
  );
};
