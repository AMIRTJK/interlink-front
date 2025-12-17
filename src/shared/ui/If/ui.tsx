import React from "react";

type IfProps = {
  is: boolean | undefined | unknown;
  children?: React.ReactNode | unknown;
  className?: string | undefined;
};

export const If: React.FC<IfProps> = ({ is, children }) => {
  if (!is) return null;
  return typeof children === "function" ? children() : children;
};
