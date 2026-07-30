import {Link, useSearchParams} from "react-router-dom";
import {Search as SearchIcon} from "lucide-react";
import {Item, ItemGroup, ItemContent, ItemTitle, ItemMedia} from "@/components/ui/item";
import {Empty, EmptyMedia, EmptyTitle, EmptyDescription} from "@/components/ui/empty";

const suggestions = [
	{title: "Question Generation", href: "/dashboard/questions"},
	{title: "Sheet Scanning", href: "/dashboard/sheet-scanning"},
	{title: "Item Analysis", href: "/dashboard/analysis"},
	{title: "Library", href: "/dashboard/library"},
	{title: "Reports", href: "/dashboard/reports"},
	{title: "Settings", href: "/dashboard/settings"},
];

export default function Search() {
	const [searchParams] = useSearchParams();
	const query = searchParams.get("q") ?? "";

	const filtered = suggestions.filter((s) =>
		s.title.toLowerCase().includes(query.toLowerCase())
	);

	return (
		<div className="flex flex-col gap-4 pt-4 pb-20">
			{query === "" ? (
				<ItemGroup className="gap-0">
					{suggestions.map((s) => (
						<Link key={s.title} to={s.href} className="w-full block">
							<Item variant="default">
								<ItemMedia>
									<SearchIcon className="size-4 text-muted-foreground" />
								</ItemMedia>
								<ItemContent>
									<ItemTitle className="text-text">{s.title}</ItemTitle>
								</ItemContent>
							</Item>
						</Link>
					))}
				</ItemGroup>
			) : filtered.length === 0 ? (
				<Empty>
					<EmptyMedia variant="icon">
						<SearchIcon />
					</EmptyMedia>
					<EmptyTitle>No results found</EmptyTitle>
					<EmptyDescription>
						Try a different search term
					</EmptyDescription>
				</Empty>
			) : (
				<ItemGroup className="gap-0">
					{filtered.map((s) => (
						<Link key={s.title} to={s.href} className="w-full block">
							<Item variant="default">
								<ItemMedia>
									<SearchIcon className="size-4 text-muted-foreground" />
								</ItemMedia>
								<ItemContent>
									<ItemTitle className="text-text">{s.title}</ItemTitle>
								</ItemContent>
							</Item>
						</Link>
					))}
				</ItemGroup>
			)}
		</div>
	);
}