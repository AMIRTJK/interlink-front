import { Dayjs } from "dayjs";

export interface IDetailsOfLetterData {
    folder?: string;
    sender?: string;
    incomingNumber?: string;
    receivingDate?: Dayjs;
    outgoingNumber?: string;
    contact?: string;
    subject?: string;
}

export interface IDetailsOfLetterProps {
    mode?: 'create' | 'show';
    initialData?: IDetailsOfLetterData;
}
