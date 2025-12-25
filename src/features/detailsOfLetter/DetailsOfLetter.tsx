import { Form } from "antd";
import { useForm } from "antd/es/form/Form";
import { renderFields } from "./lib";
import { useEffect } from "react";
import { IDetailsOfLetterProps } from "./model";
import "./DetailsOfLetter.css";

export const DetailsOfLetter: React.FC<IDetailsOfLetterProps> = ({ 
    mode = 'create', 
    initialData 
}) => {
    const [form] = useForm();

    useEffect(() => {
        if (initialData) {
            form.setFieldsValue(initialData);
        }
    }, [initialData, form]);
    
    return (
        <div className="details__container">
            <Form 
                form={form} 
                layout="vertical" 
                className="details__form"
                colon={false}
                disabled={mode === 'view'}
            >
               {renderFields()}
            </Form>
        </div>
    );
};
