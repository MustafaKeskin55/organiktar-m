declare module 'sockjs-client' {
  class SockJS {
    constructor(url: string, _reserved?: null, options?: any);
    onopen: (() => void) | null;
    onclose: ((event: CloseEvent) => void) | null;
    onerror: ((error: Error) => void) | null;
    onmessage: ((event: MessageEvent) => void) | null;
    close(code?: number, reason?: string): void;
    send(data: string): void;
    readonly readyState: number;
    readonly url: string;
    readonly protocol: string;
    static CONNECTING: number;
    static OPEN: number;
    static CLOSING: number;
    static CLOSED: number;
  }
  export = SockJS;
}
