import React from 'react';
import './ResolutionCard.css';
import { IDigitalSignature } from './model';
import { Image } from 'antd';
export interface IProps {
    position: string;
    name: string;
    content: string;
    deadline: string;
    status: string;
    signature: IDigitalSignature;
    footerName: string;
    footerDate: {
        day: string;
        month: string;
        year: string;
    };
}

export const ResolutionCard: React.FC<IProps> = ({
    position,
    name,
    content,
    deadline,
    status,
    // signature,
    footerName,
    footerDate
}) => {
    return (
        <div className="resolution-card">
        <Image
        width={50}
        src='https://i.pinimg.com/736x/79/ab/e9/79abe94de968cb4cd2e3bc7d2b93db44.jpg'
        />
        <div className="resolution-card__position">{position}</div>
        <div className="resolution-card__name">{name}</div>
        <div className="resolution-card__content">{content}</div>

        <div className="resolution-card__meta">
            <div>До: <span>{deadline}</span></div>
            <div>Статус: <span>{status}</span></div>
        </div>
            *Место для электронной подписи*
        {/* 
        <div className="resolution-card__signature-box">
            <div className="resolution-card__signature-header">
                <div className="resolution-card__flag" style={{ background: 'linear-gradient(to bottom, #cc0000 33%, #ffffff 33%, #ffffff 66%, #006600 66%)', border: '1px solid #ddd' }}></div>
                <div className="resolution-card__signature-title">Имзои электронии рақамӣ</div>
                <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Emblem_of_Tajikistan.svg/1024px-Emblem_of_Tajikistan.svg.png" 
                    alt="Small Emblem" 
                    className="resolution-card__signature-emblem"
                />
            </div>
            <div className="resolution-card__signature-subtitle">
                Маълумоти имзои электронии рақамӣ
            </div>
            <div className="resolution-card__signature-details">
                <div className="resolution-card__signature-row">Сертификат: {signature.certId}</div>
                <div className="resolution-card__signature-row">Дорандаи имзо: {signature.owner}</div>
                <div className="resolution-card__signature-row">Санаи имзо: {signature.date}</div>
                <div className="resolution-card__signature-row">Эътибор дорад: {signature.validity}</div>
            </div>
        </div> 
        */}

        <div className="resolution-card__footer">
            <div className="resolution-card__footer-name">{footerName}</div>
            <div className="resolution-card__footer-date">
                <span>«<span className="date-line">{footerDate.day}</span>»</span>
                <span className="date-line date-line--long">{footerDate.month}</span>
                <span><span className="date-line">{footerDate.year}</span>с.</span>
            </div>
        </div>
    </div>
    );
};
