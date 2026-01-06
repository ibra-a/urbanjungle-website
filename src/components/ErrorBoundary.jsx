import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console (and potentially to error reporting service)
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });

    // You can also log the error to an error reporting service here
    // Example: Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
          <motion.div
            className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6"
              animate={{
                boxShadow: [
                  "0 10px 25px rgba(239, 68, 68, 0.3)",
                  "0 20px 40px rgba(239, 68, 68, 0.4)",
                  "0 10px 25px rgba(239, 68, 68, 0.3)"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <AlertTriangle className="w-10 h-10 text-red-600" />
            </motion.div>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Oops! Something went wrong
            </h1>

            <p className="text-gray-600 mb-8 leading-relaxed">
              We're sorry, but something unexpected happened. Our team has been notified and is working to fix the issue.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-8 text-left bg-gray-50 rounded-lg p-4 border border-gray-200">
                <summary className="cursor-pointer text-sm font-semibold text-gray-700 mb-2">
                  Error Details (Development Only)
                </summary>
                <pre className="text-xs text-red-600 overflow-auto mt-2">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                onClick={this.handleReset}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-500 text-black rounded-full font-semibold hover:shadow-lg transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <RefreshCw className="w-5 h-5" />
                Try Again
              </motion.button>

              <Link
                to="/"
                className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-full font-semibold hover:border-yellow-500 hover:text-yellow-500 transition-colors"
              >
                <Home className="w-5 h-5" />
                Go Home
              </Link>
            </div>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

