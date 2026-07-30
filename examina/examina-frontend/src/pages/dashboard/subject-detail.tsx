import {useParams, useNavigate} from "react-router-dom";
import {PaginationPrevious} from "@/components/ui/pagination";
import {Label} from "@/components/ui/label";

export default function SubjectDetail() {
	const {id} = useParams();
	const navigate = useNavigate();

	return (
		<div className="flex flex-col gap-2 pb-20">
			<div className="flex items-center py-3">
				<PaginationPrevious
					text="Back"
					onClick={() => navigate(-1)}
					className="text-secondary hover:bg-secondary/10"
				/>
				<h1 className="text-xl font-bold text-secondary">
					Subject Detail
				</h1>
			</div>
			<Label className="text-text-muted">Coming soon...</Label>
		</div>
	);
}