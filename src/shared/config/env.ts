export const getEnvVar = (key: string, defaultValue: string | number = "") => {
  if (import.meta && import.meta.env[key] === undefined) {
    console.error(`Env variable ${key} is required`);
    return defaultValue;
  }

  return import.meta.env[key] || defaultValue;
};
