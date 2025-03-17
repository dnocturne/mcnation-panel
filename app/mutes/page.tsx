"use client";

import { useQuery } from "@tanstack/react-query";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";
import { Card } from "@/components/ui/card";
import { NavigationMenuDemo } from "@/components/navbar";
import { useState } from "react";

interface Mute {
	id: number;
	banned_by_name: string;
	reason: string;
	time: number;
	until: number;
	active: number;
}

export default function MutesPage() {
	const [page, setPage] = useState(1);
	const pageSize = 10;

	const { data } = useQuery({
		queryKey: ["mutes", page],
		queryFn: async () => {
			const response = await fetch(
				`/api/mutes?page=${page}&pageSize=${pageSize}`,
			);
			if (!response.ok) {
				throw new Error("Failed to fetch mutes");
			}
			return response.json();
		},
	});

	const formatDate = (timestamp: number) => {
		return new Date(timestamp).toLocaleString();
	};

	const formatDuration = (time: number, until: number) => {
		const duration = until - time;
		const hours = Math.floor(duration / (1000 * 60 * 60));
		const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
		return `${hours}h ${minutes}m`;
	};

	return (
		<div className="min-h-screen bg-background">
			<NavigationMenuDemo />
			<div className="container mx-auto py-8 px-4 mt-14">
				<h1 className="text-4xl font-bold mb-8">Mutes List</h1>

				<Card className="p-4">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Muted By</TableHead>
								<TableHead>Reason</TableHead>
								<TableHead>Date</TableHead>
								<TableHead>Duration</TableHead>
								<TableHead>Status</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{data?.items.map((mute: Mute) => (
								<TableRow key={mute.id}>
									<TableCell>{mute.banned_by_name}</TableCell>
									<TableCell>{mute.reason}</TableCell>
									<TableCell>{formatDate(mute.time)}</TableCell>
									<TableCell>{formatDuration(mute.time, mute.until)}</TableCell>
									<TableCell>
										<span
											className={`px-2 py-1 rounded-full text-xs ${
												mute.active
													? "bg-red-100 text-red-800"
													: "bg-green-100 text-green-800"
											}`}
										>
											{mute.active ? "Active" : "Inactive"}
										</span>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>

					{data && (
						<Pagination className="mt-4">
							<PaginationContent>
								<PaginationItem>
									<PaginationPrevious
										onClick={() => setPage((p) => Math.max(1, p - 1))}
										disabled={page === 1}
									/>
								</PaginationItem>
								<PaginationItem>
									<PaginationLink>{page}</PaginationLink>
								</PaginationItem>
								<PaginationItem>
									<PaginationNext
										onClick={() => setPage((p) => p + 1)}
										disabled={
											!data?.items?.length || data?.items?.length < pageSize
										}
									/>
								</PaginationItem>
							</PaginationContent>
						</Pagination>
					)}
				</Card>
			</div>
		</div>
	);
}
