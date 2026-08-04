export { useLogin } from './hooks/use-login';
export { useRegister } from './hooks/use-register';
export { default as ProtectedRoute } from './guards/protected-route';
export { authService } from './api/auth-service';
export type { LoginPayload, RegisterPayload, AuthUser, LoginResponse, RegisterResponse } from './api/auth-service';
