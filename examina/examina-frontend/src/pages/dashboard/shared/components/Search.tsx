import {Link, useSearchParams} from "react-router-dom";
import {Search as SearchIcon} from "lucide-react";
import {Item, ItemGroup, ItemContent, ItemTitle, ItemMedia} from "@/shared/ui/item";
import {Empty, EmptyMedia, EmptyTitle, EmptyDescription} from "@/shared/ui/empty";

const suggestions = [
	{title: "Question Generation", href: "/dashboard/questions-generation"},
	{title: "Sheet Scanning", href: "/dashboard/sheet-scanning"},
	{title: "Item Analysis", href: "/dashboard/analysis"},
	{title: "Library", href: "/dashboard/library"},
];

export default function Search() {
	const [searchParams] = useSearchParams();
	const query = searchParams.get("q") ?? "";

	const filtered = suggestions.filter((s) =>
		s.title.toLowerCase().includes(query.toLowerCase())
	);

	return (
		<div className="mx-auto flex w-full max-w-3xl flex-col gap-4 pt-4">
			{query === "" ? (
				<ItemGroup className="gap-0">
					{suggestions.map((s) => (
						<Link key={s.title} to={s.href} className="w-full block">
							<Item variant="default">
								<ItemMedia>
									<SearchIcon className="size-4 text-muted-foreground" />
								</ItemMedia>
								<ItemContent>
									<ItemTitle className="text-foreground">{s.title}</ItemTitle>
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
									<ItemTitle className="text-foreground">{s.title}</ItemTitle>
								</ItemContent>
							</Item>
						</Link>
					))}
				</ItemGroup>
			)}
		</div>
	);
}
