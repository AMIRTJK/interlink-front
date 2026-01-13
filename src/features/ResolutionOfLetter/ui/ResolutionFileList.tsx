import { FileTextOutlined, DownloadOutlined, PlusOutlined } from '@ant-design/icons';
import { UploadFile } from "antd";

interface IProps {
    files: UploadFile[];
    onRemove: (uid: string) => void;
}

export const ResolutionFileList: React.FC<IProps> = ({ files, onRemove }) => {
    if (files.length === 0) return null;

    return (
        <div className="resolution__files-list">
            {files.map((file, i) => (
                <div key={file.uid || i} className="resolution__file-card">
                    <div className="resolution__file-info">
                        <FileTextOutlined style={{ color: '#003eb3', fontSize: '20px' }} />
                        <span className="resolution__file-name">{file.name}</span>
                    </div>
                    <div className="resolution__file-actions">
                        <div className="resolution__file-download">
                            <DownloadOutlined />
                        </div>
                        <div className="resolution__file-remove" onClick={() => onRemove(file.uid)}>
                            <PlusOutlined style={{ transform: 'rotate(45deg)', fontSize: '14px' }} />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};
