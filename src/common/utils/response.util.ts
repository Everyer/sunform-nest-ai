export class ResponseUtil {
    static success<T>(data: T, message = 'success') {
      return {
        data,
        code: 0,
        message,
        success: true,
      };
    }
  
    static error(message = 'error', code = 1) {
      return {
        data: null,
        code,
        message,
        success: false,
      };
    }
  }