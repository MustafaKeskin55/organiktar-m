import { create } from 'zustand';
import { userApi } from '@/lib/api';
import type { User } from '@/types';

type UserRole = 'consumer' | 'producer' | 'admin' | 'super_admin' | 'manager' | 'finance';

// localStorage keys
const TOKEN_KEY = 'token';
const USER_KEY = 'user_data';

// JWT Token decode helper
function decodeJWT(token: string): any {
  if (token && token.startsWith('mock.jwt.token.')) {
    const parts = token.split('.');
    return {
      userId: parts[3],
      role: parts[4],
      sub: 'demo@example.com',
      name: 'Demo User',
      exp: Math.floor(Date.now() / 1000) + 86400 * 30 // 30 days expiry
    };
  }
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

// Check if token is expired
function isTokenExpired(token: string): boolean {
  if (token && token.startsWith('mock.jwt.token.')) return false;
  try {
    const decoded = decodeJWT(token);
    if (!decoded || !decoded.exp) return true;
    return decoded.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

// Get user from JWT token
function getUserFromToken(token: string): Partial<User> | null {
  try {
    const decoded = decodeJWT(token);
    if (!decoded) return null;
    // Role'den ROLE_ önekini kaldır ve küçük harfe çevir
    // Örn: ROLE_SUPER_ADMIN -> super_admin
    let role = decoded.role || 'consumer';
    if (role.startsWith('ROLE_')) {
      role = role.substring(5); // ROLE_ sonrasını al
    }
    return {
      id: decoded.userId?.toString() || '',
      email: decoded.sub || '',
      type: role.toLowerCase() as User['type'],
      name: decoded.name || '',
    };
  } catch {
    return null;
  }
}

// Load user from localStorage
function loadUserFromStorage(): User | null {
  try {
    const userJson = localStorage.getItem(USER_KEY);
    if (userJson) {
      return JSON.parse(userJson);
    }
  } catch {
    // Ignore parse errors
  }
  return null;
}

// Save user to localStorage
function saveUserToStorage(user: User | null) {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_KEY);
  }
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  currentRole: UserRole | null;
  needsPasswordChange: boolean;
  token: string | null;
  tokenExpiresAt: number | null;
  login: (email: string, password: string) => Promise<{ needsPasswordChange: boolean }>;
  register: (userData: Partial<User>, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  switchRole: (role: 'consumer' | 'producer') => void;
  hasMultipleRoles: () => boolean;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  clearPasswordChangeRequirement: () => void;
  isTokenValid: () => boolean;
  getToken: () => string | null;
  initialize: () => void;
}

// Initialize state from localStorage
const storedToken = localStorage.getItem(TOKEN_KEY);
const storedUser = loadUserFromStorage();
const validToken = storedToken && !isTokenExpired(storedToken) ? storedToken : null;
const initialUser = validToken ? storedUser : null;
const initialAuthenticated = !!validToken && !!initialUser;

export const useAuthStore = create<AuthState>()(
  (set, get) => ({
    user: initialUser,
    isAuthenticated: initialAuthenticated,
    isLoading: false,
    isInitialized: true,
    currentRole: initialUser?.type as UserRole || null,
    needsPasswordChange: initialUser?.forcePasswordChange || false,
    token: validToken,
    tokenExpiresAt: validToken ? Date.now() + 86400000 : null,

    initialize: () => {
      const token = localStorage.getItem(TOKEN_KEY);
      if (token && !isTokenExpired(token)) {
        const user = loadUserFromStorage();
        if (user) {
          set({
            user,
            isAuthenticated: !user.forcePasswordChange,
            currentRole: user.type as UserRole,
            needsPasswordChange: user.forcePasswordChange || false,
            token,
            tokenExpiresAt: Date.now() + 86400000,
          });
        }
      }
    },

    login: async (email: string, password: string) => {
      set({ isLoading: true });
      try {
        const response = await userApi.login(email, password);
        const { data: userData, token, expiresIn, requiresPasswordChange } = response;
        const needsPasswordChangeFlag =
          requiresPasswordChange === true || userData.forcePasswordChange === true;

        const expiresAt = Date.now() + (expiresIn || 86400000);

        localStorage.setItem(TOKEN_KEY, token);

        const user: User = {
          id: userData.id.toString(),
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          type: userData.type,
          addresses: userData.addresses || [],
          favorites: userData.favorites || [],
          createdAt: userData.createdAt,
          forcePasswordChange: userData.forcePasswordChange,
        };

        // Save to localStorage
        saveUserToStorage(user);

        set({
          user,
          isAuthenticated: !needsPasswordChangeFlag,
          isLoading: false,
          currentRole: user.type as UserRole,
          needsPasswordChange: needsPasswordChangeFlag,
          token,
          tokenExpiresAt: expiresAt,
        });

        return { needsPasswordChange: needsPasswordChangeFlag };
      } catch (error: any) {
        set({ isLoading: false });
        throw error;
      }
    },

    register: async (userData: Partial<User>, password: string) => {
      set({ isLoading: true });
      try {
        const response = await userApi.register({
          name: userData.name || '',
          email: userData.email || '',
          password: password,
          phone: userData.phone,
          type: userData.type || 'consumer',
        });

        const { data: newUserData, token, expiresIn } = response;
        const expiresAt = Date.now() + (expiresIn || 86400000);

        localStorage.setItem(TOKEN_KEY, token);

        const newUser: User = {
          id: newUserData.id.toString(),
          name: newUserData.name,
          email: newUserData.email,
          phone: newUserData.phone,
          type: newUserData.type,
          addresses: [],
          favorites: [],
          createdAt: newUserData.createdAt,
        };

        saveUserToStorage(newUser);

        set({
          user: newUser,
          isAuthenticated: true,
          isLoading: false,
          currentRole: newUser.type as UserRole,
          token,
          tokenExpiresAt: expiresAt
        });
      } catch (error: any) {
        set({ isLoading: false });
        throw new Error(error.response?.data?.error || error.message || 'Kayıt başarısız');
      }
    },

    logout: () => {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      set({
        user: null,
        isAuthenticated: false,
        currentRole: null,
        needsPasswordChange: false,
        token: null,
        tokenExpiresAt: null
      });
    },

    updateUser: (userData: Partial<User>) => {
      const { user } = get();
      if (user) {
        const updatedUser = { ...user, ...userData };
        saveUserToStorage(updatedUser);
        set({ user: updatedUser });
      }
    },

    changePassword: async (currentPassword: string, newPassword: string) => {
      const { user } = get();
      if (!user) throw new Error('Kullanıcı bulunamadı');

      try {
        await userApi.changePassword(parseInt(user.id), {
          currentPassword,
          newPassword
        });

        const updatedUser = { ...user, forcePasswordChange: false };
        saveUserToStorage(updatedUser);

        set({
          needsPasswordChange: false,
          user: updatedUser
        });
      } catch (error: any) {
        throw new Error(error.response?.data?.error || 'Şifre değiştirme başarısız');
      }
    },

    clearPasswordChangeRequirement: () => {
      set({ needsPasswordChange: false });
    },

    switchRole: (role: 'consumer' | 'producer') => {
      set({ currentRole: role });
    },

    hasMultipleRoles: () => {
      const { user } = get();
      return user?.email === 'mehmet@example.com';
    },

    isTokenValid: () => {
      const { token, tokenExpiresAt } = get();
      if (!token) return false;
      if (tokenExpiresAt && Date.now() > tokenExpiresAt) return false;
      return !isTokenExpired(token);
    },

    getToken: () => {
      const storeToken = get().token;
      if (storeToken && !isTokenExpired(storeToken)) {
        return storeToken;
      }
      // Fallback to localStorage
      const lsToken = localStorage.getItem(TOKEN_KEY);
      if (lsToken && !isTokenExpired(lsToken)) {
        // Update store with valid token from storage
        set({ token: lsToken });
        return lsToken;
      }
      return null;
    }
  })
);
