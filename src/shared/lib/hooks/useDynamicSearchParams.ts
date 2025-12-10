import { useSearchParams } from "react-router-dom";

type useDynamicSearchParamsType<T = string> = (scope?: string) => {
  paramsString: string;
  params: Record<string, string>;
  setParams: (key: T, value: string | number | unknown) => void;
  deleteParams: (keys: string | string[]) => void;
};

type ValueType = string | number | unknown;
type SetParamsHandle = (
  key: string | Record<string, ValueType>,
  value: ValueType
) => void;

export const useDynamicSearchParams: useDynamicSearchParamsType = (
  scope?: string
) => {
  const [params, setParams] = useSearchParams();
  let paramsAsObject: Record<string, string> = Object.fromEntries([...params]);

  if (scope) {
    paramsAsObject = Object.fromEntries(
      Object.keys(paramsAsObject).map((key) => [
        key.replace(/^.*?-/, ""),
        paramsAsObject[key],
      ])
    );
  }

  const setParamsHandle: SetParamsHandle = (key, value) => {
    if (typeof key !== "string") {
      const params = Object.entries(key).reduce<Record<string, unknown>>(
        (prev, [key, value]) => {
          if (value) {
            prev[key] = value;
          }

          return prev;
        },
        {}
      );

      setParams(params as unknown as Record<string, string>);
      return;
    }

    if (value) {
      params.set(key, String(value));
    } else if (params.has(key) && !value) {
      params.delete(key);
    }
    setParams(params);
  };

  const deleteParamsHandle = (keys: string | string[]) => {
    if (Array.isArray(keys)) {
      // Очищаем указанные параметры одним обновлением
      const updatedParams = new URLSearchParams(params);
      keys.forEach((key) => updatedParams.delete(key));

      setParams(updatedParams);
    } else {
      params.delete(keys);
      setParams(params);
    }
  };

  return {
    paramsString: params.toString(),
    params: paramsAsObject,
    setParams: setParamsHandle,
    deleteParams: deleteParamsHandle,
  };
};
