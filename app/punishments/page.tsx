"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NavigationMenuDemo } from "@/components/navbar";
import { PunishmentsTable } from "@/components/punishments-table";
import { useState } from "react";

type PunishmentType = "mutes" | "bans" | "kicks" | "warns";

export default function PunishmentsPage() {
	const [activeTab, setActiveTab] = useState<PunishmentType>("mutes");

	return (
		<div className="min-h-screen bg-background">
			<NavigationMenuDemo />
			<div className="container mx-auto py-8 px-4 mt-14">
				<h1 className="text-4xl font-bold mb-8">Punishments</h1>

				<Tabs
					defaultValue="mutes"
					onValueChange={(value) => setActiveTab(value as PunishmentType)}
				>
					<TabsList className="grid w-full grid-cols-4">
						<TabsTrigger value="mutes">Mutes</TabsTrigger>
						<TabsTrigger value="bans">Bans</TabsTrigger>
						<TabsTrigger value="kicks">Kicks</TabsTrigger>
						<TabsTrigger value="warns">Warns</TabsTrigger>
					</TabsList>

					<TabsContent value="mutes">
						<PunishmentsTable type="mutes" />
					</TabsContent>

					<TabsContent value="bans">
						<PunishmentsTable type="bans" />
					</TabsContent>

					<TabsContent value="kicks">
						<PunishmentsTable type="kicks" />
					</TabsContent>

					<TabsContent value="warns">
						<PunishmentsTable type="warns" />
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}
