export interface IDigitalSignature {
    certId?: string;
    owner?: string;
    date?: string;
    validity?: string;
}

export interface IAttachment {
    name?: string;
    url?: string;
}

export interface IExecutor {
    name?: string;
    position?: string;
    avatarUrl?: string;
    isMain?: boolean;
}

export interface ILetterExecutionProps {
    position?: string;
    name?: string;
    content?: string;
    deadline?: string;
    status?: string;
    signature?: IDigitalSignature;
    footerName?: string;
    footerDate?: {
        day?: string;
        month?: string;
        year?: string;
    };
    attachments?: IAttachment[];
    executors?: IExecutor[];
    emblemUrl?: string;
}