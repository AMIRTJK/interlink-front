import { Button as ButtonAntd, Image } from 'antd';
import { ReactNode } from 'react';

interface ButtonProps {
    type: 'primary' | 'default' | 'dashed' | 'link' | 'text';
    text?: string;
    htmlType?: 'button' | 'submit' | 'reset';
    withIcon?: boolean;
    icon?: React.ReactNode | string;
    style?: { [key: string]: string };
    onClick?: () => void;
    loading?: boolean;
    disabled?: boolean;
    className?: string;
    antdIcon?: React.ReactNode;
    block?: boolean;
}

const If = ({ is, children }: { is: boolean; children: ReactNode }) => (is ? <>{children}</> : null);

export const Button = ({ text, withIcon, icon, antdIcon, block, ...props }: ButtonProps) => {
    return (
        <ButtonAntd {...props} block={block}>
            <If is={!!withIcon}>
                <Image
                    src={typeof icon === 'string' ? icon : undefined}
                    preview={false}
                    style={{ minWidth: '24px', minHeight: '24px', width: '100%' }}
                />
            </If>
            <If is={!!antdIcon}>{antdIcon}</If>
            <p>{text}</p>
        </ButtonAntd>
    );
};
