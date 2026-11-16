// API client implementing docs/api-contract.md.
export interface ApiErrorBody {
  error: { code: string; message: string; fields?: Record<string, string> };
}

export class ApiError extends Error {
  status: number;
  code: string;
  fields?: Record<string, string>;
  constructor(status: number, code: string, message: string, fields?: Record<string, string>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  createdAt?: string;
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`/api${path}`, {
      method,
      credentials: 'include',
      headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, 'NETWORK_ERROR', 'Cannot reach the server. Check your connection and try again.');
  }
  let data: unknown = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }
  if (!res.ok) {
    const err = (data as Partial<ApiErrorBody> | null)?.error;
    let message = err?.message ?? 'Something went wrong. Please try again.';
    if (res.status === 429 && !err?.message) message = 'Too many requests. Please wait a while and try again.';
    throw new ApiError(res.status, err?.code ?? 'INTERNAL_ERROR', message, err?.fields);
  }
  return data as T;
}

export const api = {
  me: async (): Promise<User> => (await request<{ user: User }>('GET', '/auth/me')).user,
  signUp: async (input: {
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
  }): Promise<User> => (await request<{ user: User }>('POST', '/auth/signup', input)).user,
  signIn: async (input: { email: string; password: string }): Promise<User> =>
    (await request<{ user: User }>('POST', '/auth/signin', input)).user,
  signOut: async (): Promise<void> => {
    await request('POST', '/auth/signout');
  },
  contact: async (input: { name: string; email: string; subject: string; message: string }): Promise<void> => {
    await request('POST', '/contact', input);
  },
};
