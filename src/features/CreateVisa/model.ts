export enum VisaTemplate {
  APPROVED = 'Согласовано',
  REJECTED = 'Отклонено',
  REVIEW = 'На рассмотрении',
}

export interface ICreateVisaModal {
  open: boolean;
  onClose: () => void;
  onSubmit: (value: string) => void;
}