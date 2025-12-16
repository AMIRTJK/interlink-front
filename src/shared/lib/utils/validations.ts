export const phoneNumberRules = {
  validator(_: unknown, value: string) {
    if (!/^\d*$/.test(value)) {
      return Promise.reject("Допустимы только цифры");
    }
    if (value.length !== 9) {
      return Promise.reject("Введите ровно 9 цифр, без кода страны");
    }
    return Promise.resolve();
  },
};

export const requiredRule: { [key: string]: string | boolean } = {
  required: true,
  message: "Поле обязательно",
};

export const emailRules = [
  {
    validator(_: unknown, value: string) {
      if (!value) {
        return Promise.resolve();
      }

      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

      if (!emailRegex.test(value)) {
        return Promise.reject("Пожалуйста, введите корректный email-адрес");
      }

      return Promise.resolve();
    },
  },
];

export const numberRules = [
  {
    required: true,
    message: "Обязательное поле",
  },
  {
    validator(_: unknown, value: string) {
      if (value && !/^\d+$/.test(value)) {
        return Promise.reject("Допустимы только цифры");
      }
      return Promise.resolve();
    },
  },
];
