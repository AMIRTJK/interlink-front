import React from "react";
import { CheckOutlined } from "@ant-design/icons";

interface CustomStepperProps {
  items: { title: string }[];
  current: number;
}

export const CustomStepper: React.FC<CustomStepperProps> = ({
  items,
  current,
}) => {
  return (
    <div className="w-full flex items-start justify-between">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const isCompleted = index < current;
        const isActive = index === current;

        // Цвета (можно вынести в переменные или tailwind config)
        const greenColor = "#229A2E"; // text-green-500
        const grayColor = "#D1D5DB"; // text-gray-300
        const darkGrayText = "#9CA3AF"; // text-gray-400

        return (
          <React.Fragment key={index}>
            {/* Step Circle & Label */}
            <div className="flex flex-col items-center relative z-10 gap-2 min-w-[80px]">
              {/* Circle */}
              <div
                className="flex items-center justify-center rounded-full border-2 transition-all duration-300"
                style={{
                  width: "40px",
                  height: "40px",
                  backgroundColor: isCompleted ? greenColor : "#fff",
                  borderColor: isCompleted || isActive ? greenColor : grayColor,
                  color: isCompleted
                    ? "#fff"
                    : isActive
                      ? greenColor
                      : darkGrayText,
                }}
              >
                {isCompleted ? (
                  <CheckOutlined
                    style={{ fontSize: "18px", fontWeight: "bold" }}
                  />
                ) : (
                  <span className="text-lg font-semibold">{index + 1}</span>
                )}
              </div>

              {/* Label */}
              <div
                className="text-center text-xs sm:text-sm font-medium transition-colors duration-300 max-w-[120px]"
                style={{
                  color: isActive || isCompleted ? "#229A2E" : "#374151",
                }}
              >
                {item.title}
              </div>
            </div>

            {/* Line Connector (не рисуем после последнего элемента) */}
            {!isLast && (
              <div
                className="flex-1 mx-2 mt-5 h-[3px] rounded transition-all duration-500"
                style={{
                  backgroundColor: index < current ? greenColor : grayColor,
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
