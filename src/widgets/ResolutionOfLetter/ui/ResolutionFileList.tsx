import { FileTextOutlined, DownloadOutlined, PlusOutlined } from '@ant-design/icons';

interface IProps {
    files: any[];
    onRemove: (id: number) => void;
    isAllowed: boolean;
}

export const ResolutionFileList: React.FC<IProps> = ({ files, onRemove, isAllowed }) => {
    if (!files || files.length === 0) return null;

    return (
        <div className="resolution__files-list">
            {files.map((file) => (
                <div key={file.id} className="resolution__file-card">
                    <div className="resolution__file-info">
                        <FileTextOutlined style={{ color: '#003eb3', fontSize: '20px' }} />
                        <a 
                            href={file.url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="resolution__file-name"
                            title={file.original_name}
                        >
                            {file.original_name}
                        </a>
                    </div>
                    <div className="resolution__file-actions">
                        <a href={file.url} download={file.original_name} className="resolution__file-download">
                            <DownloadOutlined />
                        </a>
                        {isAllowed && (
                            <div className="resolution__file-remove" onClick={() => onRemove(file.id)}>
                                <PlusOutlined style={{ transform: 'rotate(45deg)', fontSize: '14px' }} />
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};
