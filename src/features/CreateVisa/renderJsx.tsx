import React, { useState, useCallback } from 'react';
import { Button, message, Empty, Typography } from 'antd';
import { PlusOutlined, FileTextOutlined } from '@ant-design/icons';
import { CreateVisaModal } from './CreateVisaModal';
import { useModalState } from '@shared/lib';

export const RenderJSX: React.FC = () => {
  const createVisaModal = useModalState();
  
  const [visas, setVisas] = useState<string[]>([]);

  const handleSubmit = useCallback((visaText: string) => {
    setVisas((prev) => [visaText, ...prev]);
    message.success('Виза успешно добавлена');
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8 font-sans">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Шапка */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center justify-between">
          <div>
            <Typography.Title level={4} style={{ margin: 0 }}>
              Визы документа
            </Typography.Title>
            <Typography.Text type="secondary">
              Список принятых решений
            </Typography.Text>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={createVisaModal.open} 
            size="large"
          >
            Добавить
          </Button>
        </div>

        {/* Список виз */}
        <div className="space-y-3">
          {visas.length === 0 ? (
            <div className="bg-white rounded-xl p-8 border border-gray-100">
              <Empty description="Нет виз" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            </div>
          ) : (
            visas.map((visa, index) => (
              <div
                key={index}
                className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex gap-3 animate-fade-in"
              >
                <div className="bg-blue-50 p-2 rounded-full h-fit">
                  <FileTextOutlined className="text-blue-500 text-lg" />
                </div>
                <div>
                  <div className="font-medium text-gray-800">{visa}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    {new Date().toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <CreateVisaModal
        open={createVisaModal.isOpen}   
        onClose={createVisaModal.close} 
        onSubmit={handleSubmit}
      />
    </div>
  );
};