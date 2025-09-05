export interface ErrorDetails {
  message: string;
  code?: string;
  status?: number;
  timestamp?: string;
}

export class AppError extends Error {
  public code?: string;
  public status?: number;
  public timestamp: string;

  constructor(message: string, code?: string, status?: number) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.status = status;
    this.timestamp = new Date().toISOString();
  }
}

export const handleError = (error: unknown): ErrorDetails => {
  console.error('Error occurred:', error);
  
  if (error instanceof AppError) {
    return {
      message: error.message,
      code: error.code,
      status: error.status,
      timestamp: error.timestamp,
    };
  }
  
  if (error instanceof Error) {
    return {
      message: error.message,
      timestamp: new Date().toISOString(),
    };
  }
  
  return {
    message: 'An unexpected error occurred',
    timestamp: new Date().toISOString(),
  };
};

export const logError = (error: ErrorDetails, context?: string) => {
  const errorLog = {
    ...error,
    context,
    userAgent: navigator.userAgent,
    url: window.location.href,
  };
  
  console.error('Error logged:', errorLog);
  
  // In production, you might want to send this to an error tracking service
  // Example: Sentry, LogRocket, etc.
};