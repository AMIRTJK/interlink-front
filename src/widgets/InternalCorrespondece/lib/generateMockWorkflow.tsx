export const generateMockWorkflow = (originalData: any) => {
  const mockDocs = [
    {
      id: 101,
      subject: "Касательно закупки оборудования на 2026 год (Основной)",
      reg_number: "ИСХ-2024/005",
      date: "01.02.2026",
      type: "letter",
    },
    {
      id: 102,
      subject: "Служебная записка от IT департамента",
      reg_number: "ВН-12",
      date: "03.02.2026",
      type: "memo",
    },
    {
      id: 103,
      subject: "Приложение №1: Техническая спецификация серверов",
      reg_number: "ПРИЛ-01",
      date: "03.02.2026",
      type: "attachment",
    },
    {
      id: 104,
      subject: "Смета расходов (предварительная)",
      reg_number: "СМ-2026",
      date: "04.02.2026",
      type: "attachment",
    },
  ];

  const realSignatures = originalData?.data?.signatures || [];
  const realDocs = originalData?.data?.incoming.items || [];

  const realApprovals = (originalData?.data?.approvals || []).map(
    (item: any) => ({
      ...item,
      user: item.approver || item.user,
    }),
  );

  return {
    data: {
      documents: realDocs,
      signatures: realSignatures,
      approvals: realApprovals,
    },
  };
};
