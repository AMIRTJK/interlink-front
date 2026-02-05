export const generateMockWorkflow = (originalData: any) => {
  // if (originalData?.data?.signatures?.length > 0) return originalData;

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

  // Генерируем 15 согласующих для теста скролла
  const mockApprovers = Array.from({ length: 15 }).map((_, index) => ({
    id: 100 + index,
    status:
      index < 2
        ? "approved"
        : index === 2
          ? "rejected"
          : index === 3
            ? "pending"
            : "pending",
    updated_at: index < 3 ? "2026-02-05T10:00:00" : null,
    user: {
      id: 100 + index,
      full_name: `Пользователь Согласующий ${index + 1}`,
      position:
        index === 3 ? "Начальник управления (Текущий)" : "Главный специалист",
      photo_path: null,
    },
  }));

  return {
    data: {
      documents: mockDocs,
      signatures: [
        {
          id: 99,
          status: "pending", // Ждем подписи
          user: {
            id: 99,
            full_name: "Директор Генеральный И.",
            position: "Генеральный директор",
            photo_path: null,
          },
        },
      ],
      approvals: mockApprovers,
    },
  };
};
