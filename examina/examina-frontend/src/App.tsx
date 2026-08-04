// src/App.tsx
import AppRouter from './app/routes';
import { Toaster } from '@/shared/ui/toast';

export default function App() {
	return (
		<>
			<AppRouter />
			<Toaster />
		</>
	);
}
