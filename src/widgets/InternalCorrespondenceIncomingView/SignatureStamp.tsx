import { DSStampPreview } from "@widgets/CreateInternalCorrespondence/ui/DSStampPreview";

interface IProps {
  name: string;
  certSerial: string;
  signedAt: string;
  validUntil: string;
}

// Визуальная ЭЦП с просмотром в полном размере — 1-в-1 с исходящим письмом.
// Раньше здесь лежала копия разметки, и правки расходились между экранами
// (z-index окна подписи чинили только тут), поэтому оставлен общий компонент.
export const SignatureStamp = (props: IProps) => <DSStampPreview {...props} />;
