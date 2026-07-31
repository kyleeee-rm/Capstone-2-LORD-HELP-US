import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/shared/stores';
import { authService } from '../api/auth-service';
import { parseApiError } from '@/shared/lib';

type LoginErrors = {
  field: string;
  server: string;
};

function validateCredentials(email: string, password: string): string | null {
  if (!email.trim()) return 'Email address is required';
  if (!password) return 'Password is required';
  return null;
}

export function useLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<LoginErrors>({ field: '', server: '' });
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  const clearErrors = () => setErrors({ field: '', server: '' });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearErrors();

    const validationError = validateCredentials(email, password);
    if (validationError) {
      setErrors({ field: validationError, server: '' });
      return;
    }

    setLoading(true);
    try {
      const data = await authService.login({ email, password });
      setAuth(data.user, data.access_token, data.expires_in);
      navigate('/dashboard');
    } catch (err: unknown) {
      setErrors({ field: '', server: parseApiError(err, 'Invalid email or password') });
    } finally {
      setLoading(false);
    }
  };

  return {
    email, setEmail,
    password, setPassword,
    showPassword, setShowPassword,
    errors, loading,
    handleSubmit,
  };
}
