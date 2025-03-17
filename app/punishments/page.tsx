"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NavigationMenuDemo } from "@/components/navbar";
import { PunishmentsTable } from "@/components/punishments-table";

// Export the PunishmentType so it can be used in the PunishmentsTable component
export type PunishmentType = "mutes" | "bans" | "kicks" | "warns";

export default function PunishmentsPage() {
	return (
		<div className="min-h-screen bg-background">
			<NavigationMenuDemo />
			<div className="container mx-auto py-8 px-4 mt-14">
				<h1 className="text-4xl font-bold mb-8">Punishments</h1>

				<Tabs defaultValue="mutes">
					<TabsList className="grid w-full grid-cols-4">
						<TabsTrigger value="mutes">Mutes</TabsTrigger>
						<TabsTrigger value="bans">Bans</TabsTrigger>
						<TabsTrigger value="kicks">Kicks</TabsTrigger>
						<TabsTrigger value="warns">Warns</TabsTrigger>
					</TabsList>

					<TabsContent value="mutes">
						<PunishmentsTable type={"mutes" as PunishmentType} />
					</TabsContent>

					<TabsContent value="bans">
						<PunishmentsTable type={"bans" as PunishmentType} />
					</TabsContent>

					<TabsContent value="kicks">
						<PunishmentsTable type={"kicks" as PunishmentType} />
					</TabsContent>

					<TabsContent value="warns">
						<PunishmentsTable type={"warns" as PunishmentType} />
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}
