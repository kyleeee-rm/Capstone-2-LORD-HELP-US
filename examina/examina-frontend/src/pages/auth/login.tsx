import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth-store';
import { authService } from '../../services/auth-service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert } from '@/components/ui/alert';
import { Field, FieldLabel } from '@/components/ui/field';
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@/components/ui/input-group';
import { PaginationPrevious } from '@/components/ui/pagination';
import { Spinner } from '@/components/ui/spinner';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldError('');

    if (!email.trim()) {
      setFieldError('Email address is required');
      return;
    }
    if (!password) {
      setFieldError('Password is required');
      return;
    }

    setLoading(true);

    try {
      const data = await authService.login({ email, password });
      setAuth(data.user, data.access_token);
      navigate('/dashboard');
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { detail?: string } } };
        setError(axiosErr.response?.data?.detail || 'Invalid email or password');
      } else {
        setError('Cannot connect to server');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <PaginationPrevious text="Back" onClick={() => navigate("/")} />
        <h1 className="text-lg font-bold text-text">Sign in</h1>
      </div>

      <div className="flex flex-1 flex-col px-6 pt-6">
        <div className="mb-6 text-center"><Label className="text-sm text-text-muted font-normal justify-center">
          New to Examina?{" "}
          <Button variant="link" className="p-0" onClick={() => navigate("/register")}>
            Sign up
          </Button>
        </Label></div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3.5">
          {fieldError && (
            <Alert variant="destructive" className="mb-2">
              {fieldError}
            </Alert>
          )}
          <Field>
            <FieldLabel>Email address</FieldLabel>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>

          <Field>
            <FieldLabel>Password</FieldLabel>
            <InputGroup>
              <InputGroupInput
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <InputGroupAddon align="inline-end">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <InputGroupButton
                          size="icon-xs"
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        />
                      }
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </TooltipTrigger>
                    <TooltipContent>
                      {showPassword ? "Hide password" : "Show password"}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </InputGroupAddon>
            </InputGroup>
          </Field>

          <AlertDialog>
            <AlertDialogTrigger
              render={
                <Button variant="link" className="self-start p-0" type="button" />
              }
            >
              Forgot Password?
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reset your password</AlertDialogTitle>
                <AlertDialogDescription>
                  Enter your email address and we'll send you a link to reset your password.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => navigate("/forgot-password")}>
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button type="submit" size="lg" className="mt-2 w-full" disabled={loading}>
            {loading ? <Spinner className="size-5" /> : 'Sign in'}
          </Button>
        </form>
      </div>
    </div>
  );
}