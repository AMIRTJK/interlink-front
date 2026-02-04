import { Button } from "@shared/ui";
import { useLocation, useNavigate } from "react-router";
import arrowBack from "../../../assets/icons/arrow-left-navigate.svg";

interface IProps {
  toggleFullScreen: () => void;
  onClose: () => void;
  isFullScreen: boolean;
}

interface LocationState {
  returnToBookModal?: boolean;
  previousPath?: string;
  savedCorrespondenceId?: string | number;
}

export const HeaderExecutionModal = ({
  toggleFullScreen,
  onClose,
  isFullScreen,
}: IProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigateBack = () => {
    const state = location.state as LocationState | null;

    if (state?.returnToBookModal && state?.previousPath) {
      navigate(state.previousPath, {
        state: {
          openBookModal: true,
          savedCorrespondenceId: state.savedCorrespondenceId,
        },
      });
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="flex items-center justify-between md:pb-2 md:mb-4  border-b border-gray-100 bg-white z-20 shrink-0">
      <div className="flex items-start gap-4">
        <Button
          type="text"
          text="Назад"
          onClick={handleNavigateBack}
          withIcon={true}
          icon={arrowBack}
          className="font-medium! text-[#0037AF]!"
        />
        <h2 className="text-lg md:text-xl font-bold text-gray-900">
          Резолюция
        </h2>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={toggleFullScreen}
          className="hidden cursor-pointer md:block p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          title="Развернуть/Свернуть"
        >
          {isFullScreen ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5M15 15l5.25 5.25"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
              />
            </svg>
          )}
        </button>

        <button
          onClick={onClose}
          className="p-2 cursor-pointer text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};
