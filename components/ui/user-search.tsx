"use client";

import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface SearchResult {
	username: string;
	avatarUrl: string | null;
}

export function UserSearch() {
	const router = useRouter();
	const [query, setQuery] = useState("");
	const [results, setResults] = useState<SearchResult[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [showResults, setShowResults] = useState(false);
	const searchRef = useRef<HTMLDivElement>(null);

	// Handle click outside to close results
	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (
				searchRef.current &&
				!searchRef.current.contains(event.target as Node)
			) {
				setShowResults(false);
			}
		}

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	// Debounced search
	useEffect(() => {
		if (!query) {
			setResults([]);
			return;
		}

		const timer = setTimeout(async () => {
			setIsLoading(true);
			try {
				const response = await fetch(
					`/api/users/search?q=${encodeURIComponent(query)}`,
				);
				if (response.ok) {
					const data = await response.json();
					setResults(data);
				} else {
					setResults([]);
				}
			} catch (error) {
				console.error("Error searching for users:", error);
				setResults([]);
			} finally {
				setIsLoading(false);
			}
		}, 300);

		return () => clearTimeout(timer);
	}, [query]);

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		if (query) {
			router.push(`/profile/${query}`);
			setQuery("");
			setShowResults(false);
		}
	};

	const handleResultClick = (username: string) => {
		router.push(`/profile/${username}`);
		setQuery("");
		setShowResults(false);
	};

	return (
		<div className="relative" ref={searchRef}>
			<form onSubmit={handleSearch} className="relative">
				<div className="relative">
					<Input
						type="text"
						placeholder="Search players..."
						value={query}
						onChange={(e) => {
							setQuery(e.target.value);
							setShowResults(!!e.target.value);
						}}
						className="h-8 w-[180px] pr-8"
						onFocus={() => setShowResults(!!query)}
					/>
					<Button
						size="sm"
						variant="ghost"
						className="absolute right-0 top-0 h-8 w-8 p-0"
						type="submit"
					>
						<Search className="h-4 w-4" />
					</Button>
				</div>
			</form>

			{showResults && (
				<div className="absolute top-full mt-1 w-full bg-background shadow-md border rounded-md max-h-[300px] overflow-y-auto z-50">
					{isLoading ? (
						<div className="px-4 py-2 text-sm text-muted-foreground">
							Loading...
						</div>
					) : results.length > 0 ? (
						<ul className="divide-y divide-muted">
							{results.map((result) => (
								<li key={result.username} className="px-3 py-2">
									<button
										className="w-full flex items-center gap-2 text-left hover:bg-muted rounded px-2 py-1"
										onClick={() => handleResultClick(result.username)}
										type="button"
									>
										<Avatar className="h-6 w-6">
											{result.avatarUrl ? (
												<AvatarImage
													src={result.avatarUrl}
													alt={result.username}
												/>
											) : (
												<AvatarFallback>
													{result.username[0].toUpperCase()}
												</AvatarFallback>
											)}
										</Avatar>
										<span className="text-sm">{result.username}</span>
									</button>
								</li>
							))}
						</ul>
					) : query.length > 0 ? (
						<div className="px-4 py-2 text-sm text-muted-foreground">
							No users found
						</div>
					) : null}
				</div>
			)}
		</div>
	);
}
