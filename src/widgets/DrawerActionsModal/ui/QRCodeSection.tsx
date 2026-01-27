import React from 'react';
import { Button, QRCode } from 'antd';

export const DrawerQRCodeSection: React.FC = () => {
  return (
    <div className="mt-8">
      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 pl-1">
        QR КОД
      </div>
      <div className="rounded-2xl flex flex-col items-center justify-center gap-6 shadow-sm">
        <div className="border border-red-50 p-3 rounded-2xl bg-red-50/30">
          <QRCode 
            value="https://ant.design/" 
            color="#F87171" 
            size={140}
            bordered={false} 
          />
        </div>
        
        <Button 
          type="primary" 
          block
          size="large"
          className="bg-[#F87171] hover:bg-[#ef4444]! border-none rounded-xl font-medium shadow-red-200 shadow-md h-11"
        >
          Вставить в документ
        </Button>
      </div>
    </div>
  );
};