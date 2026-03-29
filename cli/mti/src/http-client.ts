type FetchFn = (url: string | URL | Request, init?: RequestInit) => Promise<Response>;

export class HttpClient {
  private baseUrl: string;
  private token: string | null;
  private fetch: FetchFn;

  constructor(opts: { baseUrl: string; token: string | null; fetch: FetchFn }) {
    this.baseUrl = opts.baseUrl;
    this.token = opts.token;
    this.fetch = opts.fetch;
  }

  private buildUrl(path: string, params?: Record<string, string>): string {
    const url = new URL(path, this.baseUrl);
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        url.searchParams.set(key, value);
      }
    }
    return url.toString();
  }

  private buildHeaders(hasBody: boolean): Record<string, string> {
    const headers: Record<string, string> = {};
    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }
    if (hasBody) {
      headers["Content-Type"] = "application/json";
    }
    return headers;
  }

  private async request(
    method: string,
    path: string,
    opts?: { params?: Record<string, string>; body?: unknown }
  ): Promise<unknown> {
    const url = this.buildUrl(path, opts?.params);
    const hasBody = opts?.body !== undefined;
    const headers = this.buildHeaders(hasBody);

    const init: RequestInit = {
      method,
      headers,
    };

    if (hasBody) {
      init.body = JSON.stringify(opts!.body);
    }

    const response = await this.fetch(url, init);

    if (response.status === 204) {
      return null;
    }

    return response.json();
  }

  async get(path: string, params?: Record<string, string>): Promise<unknown> {
    return this.request("GET", path, { params });
  }

  async post(path: string, body?: unknown): Promise<unknown> {
    return this.request("POST", path, { body });
  }

  async put(path: string, body?: unknown): Promise<unknown> {
    return this.request("PUT", path, { body });
  }

  async patch(path: string, body?: unknown): Promise<unknown> {
    return this.request("PATCH", path, { body });
  }

  async delete(path: string, body?: unknown): Promise<unknown> {
    return this.request("DELETE", path, { body });
  }
}
