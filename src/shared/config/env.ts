export const getEnvVar = (key: string, defaultValue: string | number = "") => {
  // Vite statically replaces import.meta.env.VAR_NAME during build/dev.
  // Dynamic lookup like import.meta.env[key] fails at runtime.
  if (key === "VITE_API_URL") {
    return import.meta.env.VITE_API_URL || defaultValue;
  }

  if (import.meta && import.meta.env[key] === undefined) {
    console.error(`Env variable ${key} is required`);
    return defaultValue;
  }

  return import.meta.env[key] || defaultValue;
};
