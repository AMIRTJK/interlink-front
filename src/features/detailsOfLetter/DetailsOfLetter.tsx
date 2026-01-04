import { useEffect } from "react";
import { renderFields } from "./lib";
import { IDetailsOfLetterProps } from "./model";
import "./DetailsOfLetter.css";

export const DetailsOfLetter: React.FC<IDetailsOfLetterProps> = ({
  // mode = "create",
  initialData,
  form,               
}) => {
  useEffect(() => {
    if (initialData) {
      form?.setFieldsValue(initialData);
    }
  }, [initialData, form]);

  return (
    <div className="details__container">
      <div className="details__form">
        {renderFields()}
      </div>
    </div>
  );
};