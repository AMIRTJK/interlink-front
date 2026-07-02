import { useGetQuery } from "@shared/lib";
import { Form, Select } from "antd";
import { DefaultOptionType } from "antd/es/select";
import {
	CSSProperties,
	ReactElement,
	useEffect,
	useState,
	useMemo,
	useCallback,
	ReactNode,
} from "react";

// внутри компонента SelectField

interface ISelectFieldProps {
	name: string;
	label?: ReactNode;
	rules?: object[];
	placeholder?: string;
	style?: CSSProperties;
	options?: DefaultOptionType[];
	className?: string;
	selectClass?: string;
	allowClear?: boolean;
	showSearch?: boolean;
	isFetchAllowed?: boolean;
	isMobile?: boolean;
	customClass?: string;
	url?: string; // Динамический URL для различных эндпоинтов
	transformResponse?: (
		data: unknown,
		extraParams?: unknown,
	) => { value: string | number; label: string }[];
	method?: "GET";
	extraTransformParams?: unknown;
	searchParamKey?: string;
	onChange?: (
		value: any,
		option?: any,
	) => void;
	mode?: "multiple" | "tags";
	autoComplete?: string;
	suffixIcon?: React.ReactNode;
	disabled?: boolean;
	params?: Record<string, string | number | boolean | undefined>;
	useToken?: boolean;
}

export const SelectField = ({
	name,
	label,
	rules,
	options,
	url,
	method = "GET",
	customClass,
	onChange,
	isFetchAllowed,
	transformResponse,
	mode,
	className = `${customClass}`,
	searchParamKey,
	suffixIcon,
	params: extraParams,
	selectClass,
	useToken,
	...props
}: ISelectFieldProps) => {
	const [isFetched, setIsFetched] = useState(false);

	const [searchTerm, setSearchTerm] = useState("");
	const usedSearchParamKey = searchParamKey || "name";

	const extraParamsString = useMemo(
		() => JSON.stringify(extraParams || {}),
		[extraParams],
	);

	const queryParams = useMemo(
		() => ({
			...(props.showSearch && searchTerm
				? { [usedSearchParamKey]: searchTerm }
				: {}),
			...extraParams,
		}),
		[props.showSearch, usedSearchParamKey, searchTerm, extraParamsString],
	);

	const { data, refetch, isFetching } = useGetQuery<unknown>({
		url: url!,
		method: method,
		params: queryParams,
		useToken: !!useToken,
		options: {
			enabled: false,
		},
	});

	// Функция загрузки данных
	const loadItems = useCallback(
		(open: boolean) => {
			if (open && url) {
				setIsFetched(true);
				refetch();
			}
		},
		[refetch, url],
	);

	const handleSearch = (value: string) => {
		setSearchTerm(value);
		setIsFetched(true);
	};

	const handleClear = () => {
		setSearchTerm("");
		setIsFetched(true);
		refetch();
	};

	const handleChange = (value: unknown) => {
		if (value === undefined || value === null || value === "") {
			handleClear();
		}
	};

	const filterOption = url
		? false
		: (input: string, option?: DefaultOptionType) =>
				(option?.label ?? "")
					.toString()
					.toLowerCase()
					.includes(input.toLowerCase());

	/**
	 * Опции считаем напрямую из query-данных, а не через отдельный useState.
	 * Раньше "заполнить items из data" и "сбросить items при смене url/params"
	 * были двумя отдельными эффектами — при маунте (напр. переоткрытие модалки
	 * с destroyOnClose, когда данные для этого url уже в кэше react-query)
	 * оба эффекта срабатывали в одном проходе, и эффект сброса, идя вторым,
	 * затирал только что подставленные данные пустым массивом.
	 */
	const dataOptions = useMemo<DefaultOptionType[]>(() => {
		if (!data) return [];

		if (transformResponse) {
			return transformResponse(data, props.extraTransformParams);
		}
		if (
			typeof data === "object" &&
			data !== null &&
			"items" in data &&
			Array.isArray((data as { items: unknown }).items)
		) {
			return (data as { items: DefaultOptionType[] }).items;
		}
		return [];
	}, [data, transformResponse, props.extraTransformParams]);

	const selectOptions = useMemo(
		() => (options ?? dataOptions) as DefaultOptionType[],
		[options, dataOptions],
	);

	useEffect(() => {
		if (isFetched && url) {
			refetch();
		}
	}, [isFetched, url, queryParams, refetch]);

	return (
		<Form.Item
			rules={rules}
			label={label}
			name={name}
			labelCol={{ span: 24 }}
			wrapperCol={{ span: 24 }}
			className={className}
			style={props.style}
		>
			<Select
				className={selectClass}
				mode={mode}
				loading={isFetching}
				onDropdownVisibleChange={loadItems}
				onOpenChange={loadItems} // backward compatibility for older antd versions
				onSearch={url ? handleSearch : undefined}
				filterOption={filterOption}
				onChange={onChange ? onChange : handleChange}
				disabled={props.disabled}
				{...props}
				data-autocomplete="new-password"
				suffixIcon={suffixIcon}
				options={selectOptions}
			/>
		</Form.Item>
	);
};
