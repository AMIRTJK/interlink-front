import "./style.css";
import { Table } from "antd";
import { FiltersContainer } from "../FiltersContainer";
import { If } from "../If";
import { UseSkeleton } from "../Skeleton/ui";
import { EmptyState } from "../EmptyState";
import { IProps } from "./model";
import { renderPaginationItem } from "./customItemRender";
import { useUniversalTableState } from "./useUniversalTableState";

export function UniversalTable<RecordType = any, ResponseType = any>(
  props: IProps<RecordType, ResponseType>
) {
  const {
    filters,
    handleRowClick,
    title,
    rowSelection,
    actionButton,
    customPagination,
    expandable,
    onRow,
  } = props;

  const {
    form,
    page,
    perPage,
    isPending,
    columnsWithNumbers,
    handleSearch,
    handleReset,
    tableData,
    total,
    setParams,
  } = useUniversalTableState<RecordType, ResponseType>(props);

  if (isPending) {
    return <UseSkeleton loading={true} variant="table" count={1} rows={19} />;
  }

  return (
    <div
      className={
        customPagination
          ? "custom-pagination h-full flex flex-col"
          : "h-full flex flex-col"
      }
    >
      <If is={Boolean(filters)}>
        <div className={`w-full! mb-2 ${props.style}`}>
          {title && <h2 className="mr-auto text-lg font-semibold">{title}</h2>}
          <FiltersContainer
            filters={filters ?? []}
            onSearch={handleSearch}
            onReset={handleReset}
            form={form}
          />
          <If is={actionButton}>{actionButton}</If>
        </div>
      </If>
      <Table
        scroll={"scroll" in props ? props.scroll : { y: "calc(100vh - 450px)" }}
        className={props.className}
        loading={isPending}
        dataSource={tableData}
        locale={{
          emptyText: <EmptyState />,
        }}
        columns={columnsWithNumbers}
        rowKey={"id"}
        expandable={expandable}
        rowClassName={props.rowClassName}
        rowSelection={rowSelection}
        pagination={{
          total,
          current: page,
          pageSize: perPage,
          pageSizeOptions: [10, 20, 50, 100],
          showSizeChanger: props.showSizeChanger ?? true,
          onChange(page, pageSize) {
            setParams("page", page);
            setParams("per_page", pageSize);
          },
          itemRender: (current, type, originalElement) =>
            renderPaginationItem(current, type, originalElement, customPagination),
        }}
        onRow={(record) => {
          const rowProps = onRow ? onRow(record) : {};
          return {
            ...rowProps,
            onTitleClick: () => {},
            onClick: (e) => {
              rowProps.onClick?.(e);
              handleRowClick?.(record);
            },
          };
        }}
      />
    </div>
  );
}
