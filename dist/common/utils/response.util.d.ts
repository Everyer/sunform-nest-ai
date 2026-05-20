export declare class ResponseUtil {
    static success<T>(data: T, message?: string): {
        data: T;
        code: number;
        message: string;
        success: boolean;
    };
    static error(message?: string, code?: number): {
        data: null;
        code: number;
        message: string;
        success: boolean;
    };
}
