import { Avatar } from "antd";
import userAvatar from '../../../assets/images/user-avatar.jpg'
interface IProps {
    name: string;
    date?: string;
}

export const ResolutionAuthor: React.FC<IProps> = ({ name, date }) => {
    return (
        <div className="resolution__author">
            <Avatar src={userAvatar} size={44} />
            <div className="resolution__author-info">
                <p className="resolution__author-name">{name}</p>
                <p className="resolution__author-date">{date || new Date().toLocaleDateString()}</p>
            </div>
        </div>
    );
};
