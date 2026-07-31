import { PassportGuideCard } from "./passportUploadStep/PassportGuideCard";
import { PassportSide } from "./passportUploadStep/PassportSide";
import type {
  IPassportSides,
  TSide,
} from "./passportUploadStep/passportUploadStepModel";

export type {
  IPassportFile,
  IPassportSides,
} from "./passportUploadStep/passportUploadStepModel";

interface IProps {
  value: IPassportSides;
  onChange: (value: IPassportSides) => void;
}

// Шаг загрузки паспорта — обязательный первый шаг создания сотрудника.
// Загружаются две стороны: лицевая и обратная. В будущем данные из фото
// будут распознаваться (OCR) и автозаполнять форму.
export const PassportUploadStep = ({ value, onChange }: IProps) => {
  const setSide = (side: TSide, file: File | null) => {
    const prev = value[side];
    if (prev) URL.revokeObjectURL(prev.previewUrl);
    onChange({
      ...value,
      [side]: file ? { file, previewUrl: URL.createObjectURL(file) } : null,
    });
  };

  return (
    <div className="mb-2 space-y-3">
      <PassportGuideCard />

      {/* Две стороны паспорта */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <PassportSide
          side="front"
          value={value.front}
          onSelect={(file) => setSide("front", file)}
          onRemove={() => setSide("front", null)}
        />
        <PassportSide
          side="back"
          value={value.back}
          onSelect={(file) => setSide("back", file)}
          onRemove={() => setSide("back", null)}
        />
      </div>
    </div>
  );
};
