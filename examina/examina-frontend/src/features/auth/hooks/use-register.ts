import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../api/auth-service';
import { parseApiError } from '@/shared/lib';

type RegisterErrors = {
  field: string;
  server: string;
};

type RegisterInput = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

function validateRegistration(input: RegisterInput): string | null {
  if (!input.firstName.trim()) return 'First name is required';
  if (!input.lastName.trim()) return 'Last name is required';
  if (!input.email.trim()) return 'Email address is required';
  if (!input.password) return 'Password is required';
  return null;
}

export function useRegister() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<RegisterErrors>({ field: '', server: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const clearErrors = () => setErrors({ field: '', server: '' });

  const submit = async () => {
    clearErrors();

    const validationError = validateRegistration({ firstName, lastName, email, password });
    if (validationError) {
      setErrors({ field: validationError, server: '' });
      return;
    }

    setLoading(true);
    try {
      await authService.register({
        email,
        password,
        first_name: firstName,
        last_name: lastName,
      });
      navigate('/login');
    } catch (err: unknown) {
      setErrors({ field: '', server: parseApiError(err, 'Registration failed') });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    submit();
  };

  return {
    firstName, setFirstName,
    lastName, setLastName,
    email, setEmail,
    password, setPassword,
    showPassword, setShowPassword,
    errors, loading,
    handleSubmit, submit,
  };
}
