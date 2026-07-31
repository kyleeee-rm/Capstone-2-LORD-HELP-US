import {useNavigate} from "react-router-dom";
import {Button} from "@/shared/ui/button";
import {ArrowLeft} from "lucide-react";

type PlaceholderPageProps = {
	title: string;
	showBackButton?: boolean;
};

export default function PlaceholderPage({
	title,
	showBackButton = true,
}: PlaceholderPageProps) {
	const navigate = useNavigate();

	return (
		<div className="flex flex-col gap-4 pb-20">
			{showBackButton && (
				<div className="flex items-center gap-3">
					<Button
						variant="ghost"
						size="icon-sm"
						onClick={() => navigate(-1)}
						aria-label="Back">
						<ArrowLeft className="h-5 w-5" />
					</Button>
					<h1 className="text-2xl font-bold text-text">{title}</h1>
				</div>
			)}
			{!showBackButton && (
				<h1 className="text-2xl font-bold text-text">{title}</h1>
			)}
			<p className="text-sm text-text-muted">This page is under construction.</p>
		</div>
	);
}
