export interface ITestAccount {
	id: number;
	fullName: string;
	phone: string;
	position: string;
	role?: string;
	department?: string;
}

export const extractTestPhoneLocal = (fullPhone: string): string => {
	// Removes +992 or 992 prefix and keeps remaining digits
	const cleaned = fullPhone.replace(/^(\+?992)/, "").replace(/\D/g, "");
	return cleaned;
};

export const DEV_TEST_ACCOUNTS: ITestAccount[] = [
	{
		id: 1,
		fullName: "Admin Super Root",
		phone: "+992900000001",
		position: "Super Administrator",
		role: "super_admin",
		department: "Root Management",
	},
	{
		id: 2,
		fullName: "Хасанов Рустам Рустамович",
		phone: "+992555555551",
		position: "Руководитель",
		role: "super_admin",
		department: "Root Management",
	},
	{
		id: 3,
		fullName: "Сафаров Азиз Азизович",
		phone: "+992555555552",
		position: "Первый заместитель",
		role: "super_admin",
		department: "Root Management",
	},
	{
		id: 4,
		fullName: "Рахимов Фаридун Фаридунович",
		phone: "+992555555553",
		position: "Заместитель №1",
		role: "super_admin",
		department: "Root Management",
	},
	{
		id: 5,
		fullName: "Каримов Тимур Тимурович",
		phone: "+992555555554",
		position: "Заместитель №2",
		role: "super_admin",
		department: "Root Management",
	},
	{
		id: 6,
		fullName: "Шарипов Сухроб Сухробович",
		phone: "+992555555555",
		position: "Заместитель №3",
		role: "super_admin",
		department: "Root Management",
	},
	{
		id: 7,
		fullName: "Алиева Зарина Алиевна",
		phone: "+992555555556",
		position: "Руководитель департамента",
		role: "super_admin",
		department: "Root Management",
	},
	{
		id: 8,
		fullName: "Усманова Нигина Рустамовна",
		phone: "+992555555557",
		position: "Руководитель отдела №1",
		role: "super_admin",
		department: "Root Management",
	},
	{
		id: 9,
		fullName: "Саидова Мадина Акмаловна",
		phone: "+992555555558",
		position: "Руководитель отдела №2",
		role: "super_admin",
		department: "Root Management",
	},
	{
		id: 10,
		fullName: "Назарова Фируза Хакимовна",
		phone: "+992555555559",
		position: "Руководитель отдела №3",
		role: "super_admin",
		department: "Root Management",
	},
	{
		id: 11,
		fullName: "Курбонов Далер Фирузович",
		phone: "+992666666661",
		position: "Главный специалист №1",
		role: "super_admin",
		department: "Root Management",
	},
	{
		id: 12,
		fullName: "Одинаев Хусрав Джонович",
		phone: "+992666666662",
		position: "Главный специалист №2",
		role: "super_admin",
		department: "Root Management",
	},
	{
		id: 13,
		fullName: "Юсупов Парвиз Ахмедович",
		phone: "+992666666663",
		position: "Главный специалист №3",
		role: "super_admin",
		department: "Root Management",
	},
	{
		id: 14,
		fullName: "Абдуллоева Ситора Комроновна",
		phone: "+992666666664",
		position: "Специалист №1",
		role: "super_admin",
		department: "Root Management",
	},
	{
		id: 15,
		fullName: "Бобоева Гулноза Аброровна",
		phone: "+992666666665",
		position: "Специалист №2",
		role: "super_admin",
		department: "Root Management",
	},
	{
		id: 16,
		fullName: "Гафуров Махмуд Собирович",
		phone: "+992666666666",
		position: "Специалист №3",
		role: "super_admin",
		department: "Root Management",
	},
	{
		id: 17,
		fullName: "Джураев Алишер Парвизович",
		phone: "+992666666667",
		position: "Общий отдел",
		role: "super_admin",
		department: "Root Management",
	},
	{
		id: 18,
		fullName: "Имомова Заррина Хасановна",
		phone: "+992666666668",
		position: "Кадр",
		role: "super_admin",
		department: "Root Management",
	},
	{
		id: 19,
		fullName: "Км Км Км",
		phone: "+992999999999",
		position: "ыф",
		role: "super_admin",
		department: "Root Management",
	},
	{
		id: 20,
		fullName: "Sda Dsa Dsa",
		phone: "+992222222222",
		position: "dsa",
		role: "super_admin",
		department: "Root Management",
	},
];
