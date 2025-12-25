import React from 'react';
import { Image } from 'antd';
import { ILetterExecutionProps } from './model';
import { AttachmentItem } from './ui/AttachmentItem';
import { ExecutorCard } from './ui/ExecutorCard';
import { DigitalSignatureBox } from './ui/DigitalSignatureBox';
import { If } from '@shared/ui';
import './LetterExecution.css';

export const LetterExecution: React.FC<ILetterExecutionProps> = ({
    position = "ДОЛЖНОСТЬ ОТСУТСТВУЕТ",
    name = "ФИО ОТСУТСТВУЕТ",
    content = "Контент не передан",
    deadline = "00.00.0000",
    status = "Статус не определен",
    signature = {},
    footerName = "ФИО ОТСУТСТВУЕТ",
    footerDate = {
        day: "00",
        month: "Месяц",
        year: "0000"
    },
    attachments = [{}],
    executors = [{}],
    emblemUrl = 'https://i.pinimg.com/736x/79/ab/e9/79abe94de968cb4cd2e3bc7d2b93db44.jpg'
}) => {
    return (
        <div className="letter-execution">
            {/* Header Emblem */}
            <div className="letter-execution__header">
                <Image
                    width={50}
                    src={emblemUrl}
                    preview={false}
                    className="letter-execution__emblem"
                />
            </div>

            <div className="letter-execution__position">{position}</div>
            <div className="letter-execution__name">{name}</div>
            <div className="letter-execution__content">{content}</div>

            <div className="letter-execution__meta">
                <div className="letter-execution__meta-item">До: <span>{deadline}</span></div>
                <div className="letter-execution__meta-item">Статус: <span>{status}</span></div>
            </div>

            {/* Digital Signature Section */}
            <DigitalSignatureBox {...signature} />

            {/* Footer Sign-off */}
            <div className="letter-execution__footer">
                <div className="letter-execution__footer-name">{footerName}</div>
                <div className="letter-execution__footer-date">
                    <span>«<span className="date-line">{footerDate?.day}</span>»</span>
                    <span className="date-line date-line--long">{footerDate?.month}</span>
                    <span><span className="date-line">{footerDate?.year}</span>с.</span>
                </div>
            </div>

            {/* Attachments Section */}
            <If is={!!attachments?.length}>
                <div className="letter-execution__attachments">
                    {attachments?.map((file, idx) => (
                        <AttachmentItem key={idx} {...file} />
                    ))}
                </div>
            </If>

            {/* Executors Section */}
            <If is={!!executors?.length}>
                <div className="letter-execution__executors">
                    {executors?.map((executor, idx) => (
                        <ExecutorCard key={idx} {...executor} />
                    ))}
                </div>
            </If>
        </div>
    );
};
