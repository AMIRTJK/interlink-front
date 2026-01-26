export type SkeletonVariant = 'text' | 'avatar' | 'button' | 'input' | 'image' | 'card';

export interface ISkeletonProps {
  loading: boolean;
  variant?: SkeletonVariant;
  children?: React.ReactNode;
  active?: boolean;
  count?: number;
  className?: string;
  rows?: number; 
  size?: 'large' | 'small' | 'default';
  block?: boolean;
}