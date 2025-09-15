import { ErrorUtils } from 'react-native';

interface ErrorInfo {
  error: Error;
  isFatal: boolean;
  timestamp: string;
  userAgent?: string;
  url?: string;
}

class GlobalErrorHandler {
  private static instance: GlobalErrorHandler;
  private errorLog: ErrorInfo[] = [];
  private maxLogSize = 50;

  private constructor() {
    this.setupErrorHandlers();
  }

  public static getInstance(): GlobalErrorHandler {
    if (!GlobalErrorHandler.instance) {
      GlobalErrorHandler.instance = new GlobalErrorHandler();
    }
    return GlobalErrorHandler.instance;
  }

  private setupErrorHandlers() {
    // Handle React Native errors
    const originalHandler = ErrorUtils.getGlobalHandler();
    
    ErrorUtils.setGlobalHandler((error: Error, isFatal?: boolean) => {
      this.logError(error, isFatal || false);
      
      // Call original handler to maintain default behavior
      if (originalHandler) {
        originalHandler(error, isFatal);
      }
    });

    // Handle unhandled promise rejections
    if (typeof global !== 'undefined' && global.addEventListener) {
      global.addEventListener('unhandledrejection', (event: any) => {
        const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
        this.logError(error, false);
        console.error('Unhandled Promise Rejection:', error);
      });
    }

    // Handle global JavaScript errors (web)
    if (typeof window !== 'undefined' && window.addEventListener) {
      window.addEventListener('error', (event) => {
        const error = event.error || new Error(event.message);
        this.logError(error, false);
      });
    }
  }

  private logError(error: Error, isFatal: boolean) {
    const errorInfo: ErrorInfo = {
      error,
      isFatal,
      timestamp: new Date().toISOString(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location?.href : undefined,
    };

    // Add to log
    this.errorLog.unshift(errorInfo);
    
    // Keep log size manageable
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(0, this.maxLogSize);
    }

    // Log to console with detailed information
    console.error('=== GLOBAL ERROR HANDLER ===');
    console.error('Fatal:', isFatal);
    console.error('Error:', error.name, error.message);
    console.error('Stack:', error.stack);
    console.error('Timestamp:', errorInfo.timestamp);
    console.error('User Agent:', errorInfo.userAgent);
    console.error('URL:', errorInfo.url);
    console.error('============================');

    // In development, also log the full error object
    if (__DEV__) {
      console.error('Full Error Object:', error);
    }
  }

  public getErrorLog(): ErrorInfo[] {
    return [...this.errorLog];
  }

  public clearErrorLog(): void {
    this.errorLog = [];
  }

  public getErrorSummary(): string {
    const recentErrors = this.errorLog.slice(0, 5);
    return JSON.stringify(recentErrors.map(info => ({
      message: info.error.message,
      name: info.error.name,
      isFatal: info.isFatal,
      timestamp: info.timestamp,
    })), null, 2);
  }
}

// Initialize the global error handler
export const globalErrorHandler = GlobalErrorHandler.getInstance();

export default GlobalErrorHandler;