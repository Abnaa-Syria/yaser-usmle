import { Component } from "react";
import { withTranslation } from "react-i18next";

class GlobalErrorBoundaryInner extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("GlobalErrorBoundary:", error, info);
  }

  handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    const { t } = this.props;
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--color-bg-canvas)] px-6 py-16 text-center">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-400 mx-auto">
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M12 2a10 10 0 100 20A10 10 0 0012 2z"/></svg>
          </div>
          <h1 className="text-2xl font-black text-[var(--color-text-primary)]">{t("errorBoundary.title")}</h1>
          <p className="mt-3 max-w-md text-sm text-[var(--color-text-muted)]">{t("errorBoundary.body")}</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={this.handleRetry}
              className="btn-primary"
            >
              {t("errorBoundary.retry")}
            </button>
            <a
              href="/"
              className="btn-secondary"
            >
              {t("errorBoundary.home")}
            </a>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const GlobalErrorBoundary = withTranslation()(GlobalErrorBoundaryInner);
export default GlobalErrorBoundary;
