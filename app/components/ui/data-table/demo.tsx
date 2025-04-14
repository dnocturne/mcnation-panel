"use client";

import { useState } from "react";
import { DataTable } from "./index";
import {
	createActionsColumn,
	createDateCell,
	createCurrencyCell,
	createStatusCell,
	createSortableHeader,
} from "./columns";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";

// Sample data type
interface User {
	id: string;
	name: string;
	email: string;
	role: string;
	status: "active" | "inactive" | "pending";
	lastLogin: string;
	createdAt: string;
	subscription: {
		plan: string;
		price: number;
		renewalDate: string;
	};
}

// Sample data
const sampleUsers: User[] = Array.from({ length: 50 }).map((_, i) => ({
	id: `user-${i + 1}`,
	name: `User ${i + 1}`,
	email: `user${i + 1}@example.com`,
	role: i % 5 === 0 ? "Admin" : i % 3 === 0 ? "Moderator" : "User",
	status: i % 4 === 0 ? "inactive" : i % 7 === 0 ? "pending" : "active",
	lastLogin: new Date(
		Date.now() - Math.floor(Math.random() * 30) * 86400000,
	).toISOString(),
	createdAt: new Date(
		Date.now() - Math.floor(Math.random() * 365) * 86400000,
	).toISOString(),
	subscription: {
		plan: i % 3 === 0 ? "Premium" : i % 5 === 0 ? "Pro" : "Basic",
		price: i % 3 === 0 ? 49.99 : i % 5 === 0 ? 29.99 : 9.99,
		renewalDate: new Date(
			Date.now() + Math.floor(Math.random() * 90) * 86400000,
		).toISOString(),
	},
}));

export function DataTableDemo() {
	const [users, setUsers] = useState<User[]>(sampleUsers);

	// Define columns
	const columns: ColumnDef<User>[] = [
		{
			accessorKey: "name",
			header: createSortableHeader("Name"),
		},
		{
			accessorKey: "email",
			header: "Email",
		},
		{
			accessorKey: "role",
			header: createSortableHeader("Role"),
		},
		{
			accessorKey: "status",
			header: "Status",
			cell: createStatusCell({
				key: "status",
				statusMap: {
					active: { label: "Active", variant: "success" },
					inactive: { label: "Inactive", variant: "destructive" },
					pending: { label: "Pending", variant: "secondary" },
				},
			}),
		},
		{
			accessorKey: "lastLogin",
			header: createSortableHeader("Last Login"),
			cell: createDateCell("lastLogin"),
		},
		{
			accessorKey: "subscription.plan",
			header: "Plan",
		},
		{
			accessorKey: "subscription.price",
			header: createSortableHeader("Price"),
			cell: createCurrencyCell("subscription.price" as keyof User),
		},
		createActionsColumn<User>({
			onView: (user) => console.log("View user", user.id),
			onEdit: (user) => console.log("Edit user", user.id),
			onDelete: (user) => {
				if (confirm(`Are you sure you want to delete user ${user.name}?`)) {
					setUsers(users.filter((u) => u.id !== user.id));
				}
			},
		}),
	];

	return (
		<div className="space-y-4">
			<div className="flex justify-between items-center">
				<h2 className="text-2xl font-bold">Users</h2>
				<Button>
					<PlusCircle className="mr-2 h-4 w-4" />
					Add User
				</Button>
			</div>
			<DataTable
				columns={columns}
				data={users}
				filterColumn="name"
				filterPlaceholder="Filter users..."
				showColumnToggle={true}
				initialPageSize={10}
			/>
		</div>
	);
}
