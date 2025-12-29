interface RegistryTableProps {
  data?: unknown;
  isLoading?: boolean;
  type?: string;
}

export const RegistryTable = ({ data, isLoading }: RegistryTableProps) => {
  console.log(data, isLoading);

  return (
    <div className="bg-white w-full h-full">
      <p className="p-6">Реестр</p>
    </div>
  );
};
