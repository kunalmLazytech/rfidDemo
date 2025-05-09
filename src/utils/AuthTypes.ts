export interface DecodedUser {
    userId: string;
    email?: string;
    name?: string;
    exp: number;
    [key: string]: any;
  }
  
  export interface AuthContextType {
    user: DecodedUser | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    authFetch: (url: string, options?: RequestInit) => Promise<Response>;
    loading: boolean;
  }
  