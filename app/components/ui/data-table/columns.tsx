"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
	ArrowUpDown,
	EyeIcon,
	MoreHorizontal,
	Pencil,
	Trash,
} from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/app/components/ui/badge";

// Helper function to create a sortable header
export function createSortableHeader<T>(
	label: string,
	key: keyof T,
): ColumnDef<T>["header"] {
	return ({ column }) => {
		return (
			<Button
				variant="ghost"
				onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
				className="-ml-4 h-8"
			>
				{label}
				<ArrowUpDown className="ml-1 h-4 w-4" />
			</Button>
		);
	};
}

// Helper function to create an actions column
export function createActionsColumn<T>({
	onView,
	onEdit,
	onDelete,
	getDisabled = () => false,
}: {
	onView?: (row: T) => void;
	onEdit?: (row: T) => void;
	onDelete?: (row: T) => void;
	getDisabled?: (row: T) => boolean;
}): ColumnDef<T> {
	return {
		id: "actions",
		cell: ({ row }) => {
			const item = row.original;
			const isDisabled = getDisabled(item);

			return (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" className="h-8 w-8 p-0">
							<span className="sr-only">Open menu</span>
							<MoreHorizontal className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuLabel>Actions</DropdownMenuLabel>
						{onView && (
							<DropdownMenuItem
								onClick={() => onView(item)}
								disabled={isDisabled}
							>
								<EyeIcon className="mr-2 h-4 w-4" />
								View
							</DropdownMenuItem>
						)}
						{onEdit && (
							<DropdownMenuItem
								onClick={() => onEdit(item)}
								disabled={isDisabled}
							>
								<Pencil className="mr-2 h-4 w-4" />
								Edit
							</DropdownMenuItem>
						)}
						{onDelete && (
							<>
								<DropdownMenuSeparator />
								<DropdownMenuItem
									onClick={() => onDelete(item)}
									disabled={isDisabled}
									className="text-destructive"
								>
									<Trash className="mr-2 h-4 w-4" />
									Delete
								</DropdownMenuItem>
							</>
						)}
					</DropdownMenuContent>
				</DropdownMenu>
			);
		},
	};
}

// Helper function to create a selection column
export function createSelectionColumn<T>(): ColumnDef<T> {
	return {
		id: "select",
		header: ({ table }) => (
			<Checkbox
				checked={
					table.getIsAllPageRowsSelected() ||
					(table.getIsSomePageRowsSelected() && "indeterminate")
				}
				onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
				aria-label="Select all"
			/>
		),
		cell: ({ row }) => (
			<Checkbox
				checked={row.getIsSelected()}
				onCheckedChange={(value) => row.toggleSelected(!!value)}
				aria-label="Select row"
			/>
		),
		enableSorting: false,
		enableHiding: false,
	};
}

// Helper function to format date values
export function createDateCell<T>(
	key: keyof T,
	format = "PP",
): ColumnDef<T>["cell"] {
	return ({ row }) => {
		const value = row.getValue(key as string) as string;
		return formatDate(value, format);
	};
}

// Helper function to format currency values
export function createCurrencyCell<T>(key: keyof T): ColumnDef<T>["cell"] {
	return ({ row }) => {
		const value = row.getValue(key as string) as number;
		return formatCurrency(value);
	};
}

// Helper function to create a status badge cell
export function createStatusCell<T>({
	key,
	statusMap,
}: {
	key: keyof T;
	statusMap: Record<
		string,
		{
			label: string;
			variant:
				| "default"
				| "success"
				| "destructive"
				| "outline"
				| "secondary"
				| "warning"
				| "info";
		}
	>;
}): ColumnDef<T>["cell"] {
	return ({ row }) => {
		const value = row.getValue(key as string) as string;
		const status = statusMap[value] || { label: value, variant: "default" };

		return <Badge variant={status.variant}>{status.label}</Badge>;
	};
}
