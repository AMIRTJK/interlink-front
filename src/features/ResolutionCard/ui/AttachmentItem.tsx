import React from 'react';
import { DownloadOutlined } from '@ant-design/icons';
import { IAttachment } from '../model';

export const AttachmentItem: React.FC<IAttachment> = ({ 
    name = "БЕЗЫМЯННЫЙ ФАЙЛ", 
    url = "#" 
}) => {
    return (
        <div className="letter-execution__attachment-item">
            <DownloadOutlined className="letter-execution__attachment-icon" />
            <a href={url} className="letter-execution__attachment-link" target="_blank" rel="noopener noreferrer">
                {name}
            </a>
        </div>
    );
};
