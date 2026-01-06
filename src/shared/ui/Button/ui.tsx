import { Button as ButtonAntd } from "antd";


interface ButtonProps {
  type: "primary" | "default" | "dashed" | "link" | "text";
  text?: string;
  htmlType?: "button" | "submit" | "reset";
  withIcon?: boolean;
  icon?: React.ReactNode | string;
  iconAlt?: string;
  ariaLabel?: string;
  style?: { [key: string]: string };
  onClick?: () => void;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  antdIcon?: React.ReactNode;
  block?: boolean;
}

export const Button = ({
  text,
  withIcon,
  icon,
  iconAlt = "иконка",
  ariaLabel,
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
          alt={iconAlt}
          width="24"
          height="24"
          style={{ width: "24px", height: "24px" }}
          className="block mx-auto"
        />
      );
    }
    return icon;
  };

  const finalIcon = renderIcon() || antdIcon;

  return (
    <ButtonAntd 
      {...props} 
      block={block} 
      icon={finalIcon}
      aria-label={ariaLabel || text}
    >
      {text ? <span className="ml-2">{text}</span> : null}
    </ButtonAntd>
  );
};
