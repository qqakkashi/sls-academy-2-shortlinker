class Result {
  private statusCode: number;
  private status: string;
  private data?: any;

  constructor(statusCode: number, status: string, data?: any) {
    this.statusCode = statusCode;
    this.status = status;
    this.data = data;
  }
  bodyToString() {
    return {
      statusCode: this.statusCode,
      body: JSON.stringify({
        status: this.status,
        data: this.data,
      }),
    };
  }
}

export interface Message {
  statusCode: number;
  body: string;
}

export class MessageUtil {
  static success(data: object) {
    const result = new Result(200, "success", data);

    return result.bodyToString();
  }

  static error(code: number = 1000, message: string) {
    const result = new Result(code, "failed", message);
    return result.bodyToString();
  }
}
