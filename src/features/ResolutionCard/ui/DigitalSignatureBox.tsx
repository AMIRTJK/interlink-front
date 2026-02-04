import React from 'react';
import { IDigitalSignature } from '../model';
// import { Image } from 'antd';

export const DigitalSignatureBox: React.FC<IDigitalSignature> = ({
    certId = "ОТСУТСТВУЕТ",
    owner = "ФИО ОТСУТСТВУЕТ",
    date = "00.00.0000",
    validity = "Срок не указан"
}) => {
    return (
        <div className="letter-execution__signature-box">
            <div className="letter-execution__signature-header">
                <div className="letter-execution__flag"></div>
                <div className="letter-execution__signature-title">Имзои электронии рақамӣ</div>
                {/* <Image 
                width={50}
                height={50}
                    src="https://tse2.mm.bing.net/th/id/OIP.kAEwO6AL1baonTM-XiqMvwHaGL?rs=1&pid=ImgDetMain&o=7&rm=3" 
                    alt="Small Emblem" 
                    className="letter-execution__signature-emblem"
                /> */}
            </div>
            <div className="letter-execution__signature-subtitle">
                Маълумоти имзои электронии рақамӣ
            </div>
            <div className="letter-execution__signature-details">
                <div className="letter-execution__signature-row">Сертификат: {certId}</div>
                <div className="letter-execution__signature-row">Дорандаи имзо: {owner}</div>
                <div className="letter-execution__signature-row">Санаи имзо: {date}</div>
                <div className="letter-execution__signature-row">Эътибор дорад: {validity}</div>
            </div>
        </div>
    );
};
