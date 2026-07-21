import { Component, ReactNode, ErrorInfo } from "react";
import { AppRoutes } from "@shared/config";

interface IProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface IState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<IProps, IState> {
  public state: IState = {
    hasError: false,
  };

  public static getDerivedStateFromError(): IState {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, _errorInfo: ErrorInfo) {
    if (error.name === "NotFoundError" || error.message?.includes("insertBefore")) {
      const token = localStorage.getItem("token");
      if (!token && window.location.pathname !== AppRoutes.LOGIN) {
        window.location.replace(AppRoutes.LOGIN);
      }
    }
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.replace("/");
  };

  public render() {
    return this.state.hasError ? (
      this.props.fallback ?? (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white p-6">
          <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-3xl p-8 shadow-2xl text-center">
            <div className="w-16 h-16 bg-red-500/10 text-red-400 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
              !
            </div>
            <h2 className="text-xl font-bold mb-2">Произошла ошибка при отображении</h2>
            <p className="text-sm text-slate-400 mb-6">
              Приложение столкнулось с непредвиденной ошибкой. Попробуйте обновить страницу.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                type="button"
                onClick={this.handleReload}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold text-sm transition-colors cursor-pointer"
              >
                Обновить страницу
              </button>
              <button
                type="button"
                onClick={this.handleGoHome}
                className="px-5 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 font-semibold text-sm transition-colors cursor-pointer"
              >
                На главную
              </button>
            </div>
          </div>
        </div>
      )
    ) : (
      this.props.children
    );
  }
}
