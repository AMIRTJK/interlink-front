import React from 'react';
import { Skeleton, Space } from 'antd';
import { ISkeletonProps } from './model';

export const UseSkeleton: React.FC<ISkeletonProps> = ({
  loading,
  variant = 'text',
  children,
  active = true,
  count = 1,
  rows,
  ...rest
}) => {
  if (!loading) return <>{children}</>;

  const renderSkeleton = () => {
    switch (variant) {
      case 'avatar':
        return <Skeleton.Avatar active={active} {...rest} />;
      case 'button':
        return <Skeleton.Button active={active} {...rest} />;
      case 'input':
        return <Skeleton.Input active={active} {...rest} />;
      case 'image':
        return <Skeleton.Image active={active} />;
        case 'profile':
        return (
          <div style={{ 
            display: 'flex', 
            gap: '24px', 
            padding: '24px 32px', 
            width: '100%',
            alignItems: 'flex-start'
          }}>
            <div style={{ width: '310px'}}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
                <Skeleton.Button active={active} size='small' style={{ width: 14, height: 14,borderRadius: '30px' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 40 }}>
                <Skeleton.Avatar active={active} size={140} shape="circle" style={{ marginBottom: 20 }} />
                <Skeleton.Input active={active} style={{ width: 180, height: 28 }} />
              </div>

              <Space direction="vertical" style={{ width: '100%' }} size={8}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Skeleton.Input active={active} style={{ width: '40%', height: 14 }} size="small" />
                    <Skeleton.Input active={active} style={{ width: '45%', height: 14 }} size="small" />
                  </div>
                ))}
              </Space>
            </div>

            <div style={{ flexGrow: 1 }}>
              <Skeleton.Button active={active} block style={{ height: 40, marginBottom: 24, borderRadius: '8px' }} />
              <div style={{ display: 'flex', gap: '16px' }}>
                {Array.from({ length: 3 }).map((_, colIndex) => (
                  <div key={colIndex} style={{ 
                    flex: 1, 
                    background: '#f5f7fa', 
                    borderRadius: '12px', 
                    padding: '12px',
                    minHeight: '310px',
                    maxHeight: '310px' 
                  }}>
                    
                    {Array.from({ length: 2 }).map((_, cardIndex) => (
                      <div key={cardIndex} style={{ 
                        background: '#fff', 
                        padding: '12px', 
                      }}>
                        <Skeleton active={active} title={{ width: '80%' }} paragraph={{ rows: 2, width: '100%' }} />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 'card':
        return (
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <Skeleton.Button active={active} block style={{ height: 150 }} />
            <Skeleton active={active} paragraph={{ rows: rows || 2 }} title={false} />
          </Space>
        );
      case 'table':
        return (
          <div style={{ width: '100%' }}>
            <Skeleton.Input 
              active={active} 
              block 
              style={{ height: 32, marginBottom: 12 }} 
            />
            <Skeleton 
              active={active} 
              paragraph={{ rows: rows || 5, width: '100%' }} 
              title={false} 
            />
          </div>
        );
      default:
        return (
          <Skeleton 
            active={active} 
            title={false} 
            paragraph={{ rows: rows || 3 }} 
            {...rest} 
          />
        );
    }
  };

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <React.Fragment key={index}>
          {renderSkeleton()}
          {/* Отступ между блоками, если count > 1 */}
          {count > 1 && index < count - 1 && (
            <div style={{ marginBottom: 24 }} />
          )}
        </React.Fragment>
      ))}
    </>
  );
};