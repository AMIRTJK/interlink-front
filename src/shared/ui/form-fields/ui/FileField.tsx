import { If } from '@ui';
import { Button, Form, Upload, UploadProps, message } from 'antd';
import { useState } from 'react';
import type { RcFile, UploadFile } from 'antd/es/upload/interface';
import { ApiRoutes, ENV } from '@config';

interface IProps {
    name: string;
    label?: string | boolean;
    rules?: object[];
    customClass?: string;
    className?: string;
    isPending?: boolean;
    onUploaded?: (fileUrl: string) => void;
}

const { Item } = Form;

export const FileField = ({
    name,
    label,
    rules,
    customClass,
    isPending,
    className = '!rounded-none !border-[#019681] hover:!border-[#019681] hover:!text-[#019681] hover:!bg-transparent',
    onUploaded,
}: IProps) => {
    const [fileList, setFileList] = useState<UploadFile[]>([]);

    const uploadProps: UploadProps = {
        name: 'file',
        fileList,
        action: `${ENV.API_URL}${ApiRoutes.UPLOAD_FILE}`,
        onChange(info) {
            const { status } = info.file;
            setFileList(info.fileList.slice(-1));

            if (status === 'done') {
                const url = info.file.response?.url;
                message.success(`${info.file.name} загружен успешно`);
                if (onUploaded && url) onUploaded(url);
            } else if (status === 'error') {
                message.error(`${info.file.name} не удалось загрузить`);
            }
        },
        onRemove: () => {
            setFileList([]);
        },
        beforeUpload: (file: RcFile) => {
            const sanitizedName = file.name
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[^\w.()\- ]+/g, '')
                .replace(/\s+/g, '_');

            const newFile = new File([file], sanitizedName, { type: file.type });
            return newFile;
        },
    };

    const isFileNotSelected = fileList.length === 0;

    return (
        <Item
            label={label}
            name={name}
            labelCol={{ span: 24 }}
            wrapperCol={{ span: 24 }}
            rules={rules}
            className={`custom-form-item ${customClass} !mb-5`}
        >
            <div className="flex items-center gap-4">
                <Upload disabled={isPending} {...uploadProps}>
                    <Button disabled={isPending} className={className}>
                        Выбрать файл
                    </Button>
                </Upload>
                <If is={isFileNotSelected}>
                    <p className="text-[#222222B2]">Файл не выбран</p>
                </If>
            </div>
        </Item>
    );
};
