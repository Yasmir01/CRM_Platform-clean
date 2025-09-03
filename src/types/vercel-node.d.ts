declare module '@vercel/node' {
  export interface VercelRequest {
    method?: string;
    headers?: Record<string, any>;
    query?: Record<string, any>;
    cookies?: Record<string, any>;
    body?: any;
    socket?: any;
    [key: string]: any;
  }
  export interface VercelResponse {
    status(code: number): VercelResponse;
    json(body: any): VercelResponse;
    send(body: any): VercelResponse;
    setHeader(name: string, value: string): void;
    end(body?: any): void;
  }
}
