import { Form } from "antd";
import { useForm } from "antd/es/form/Form";
import { renderFields } from "./lib";
import "./DetailsOfLetter.css";

export const DetailsOfLetter = () => {
    const [form] = useForm();
    
    return (
        <div className="details__container">
            <Form 
                form={form} 
                layout="vertical" 
                className="details__form"
                colon={false}
            >
               {renderFields()}
            </Form>
        </div>
    );
};
