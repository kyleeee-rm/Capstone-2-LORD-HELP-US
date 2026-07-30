import {useNavigate} from "react-router-dom";
import {Button} from "@/components/ui/button";

export default function Library() {
	const navigate = useNavigate();

	return (
		<div className="flex flex-col gap-4 pt-4 pb-20">
			<div className="flex items-center gap-3">
				<h1 className="text-2xl font-bold text-text">Library</h1>
			</div>
			<p className="text-sm text-text-muted">
				This page is under construction.
			</p>
		</div>
	);
}
