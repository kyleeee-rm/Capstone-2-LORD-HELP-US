import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
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

export default function Register() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authService.register({ email, password, first_name: firstName, last_name: lastName });
      navigate('/login');
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { detail?: string } } };
        setError(axiosErr.response?.data?.detail || 'Registration failed');
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
        <h1 className="text-lg font-bold text-text">Sign up</h1>
      </div>
      <div className="flex flex-1 flex-col px-6 pt-6">
        <div className="mb-6 text-center"><Label className="text-sm text-text-muted font-normal justify-center">
          Already have an account?{" "}
          <Button variant="link" className="p-0" onClick={() => navigate("/login")}>
            Sign in
          </Button>
        </Label></div>
        {error && (
          <Alert variant="destructive" className="mb-4">
            {error}
          </Alert>
        )}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <Field>
            <FieldLabel>First name</FieldLabel>
            <Input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
          </Field>
          <Field>
            <FieldLabel>Last name</FieldLabel>
            <Input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
          </Field>
          <Field>
            <FieldLabel>Email address</FieldLabel>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </Field>
          <Field>
            <FieldLabel>Password</FieldLabel>
            <InputGroup>
              <InputGroupInput
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
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
                <Button type="submit" size="lg" className="mt-2 w-full" disabled={loading} />
              }
            >
              {loading ? <Spinner className="size-5" /> : 'Create Account'}
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Create your account?</AlertDialogTitle>
                <AlertDialogDescription>
                  By creating an account, you agree to our Terms of Service and Privacy Policy.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleSubmit}>
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </form>
      </div>
    </div>
  );
}