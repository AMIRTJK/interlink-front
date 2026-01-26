import React from 'react';
import { Skeleton, Space } from 'antd';
import { ISkeletonProps } from './model';

export const UseSkeleton: React.FC<ISkeletonProps> = ({
  loading,
  variant = 'text',
  children,
  active = true,
  count = 1,
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
      case 'card':
        return (
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <Skeleton.Button active={active} block style={{ height: 150 }} />
            <Skeleton active={active} paragraph={{ rows: 2 }} title={false} />
          </Space>
        );
      case 'table':
        return (
          <div style={{ width: '100%' }}>
            <Skeleton.Input 
              active={active} 
              block 
              style={{ height: 30, marginBottom: 12 }} 
            />
            <Skeleton 
              active={active} 
              paragraph={{ rows: 8, width: '100%' }} 
              title={false} 
            />
          </div>
        );
      default:
        return <Skeleton active={active} {...rest} />;
    }
  };

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <React.Fragment key={index}>
          {renderSkeleton()}
          {count > 1 && index < count - 1 && (
            <div style={{ marginBottom: 16 }} />
          )}
        </React.Fragment>
      ))}
    </>
  );
};