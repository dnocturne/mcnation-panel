"use client";

import { useEffect, useState } from "react";
import { socket } from "@/lib/websocket";
import Navbar from "@/components/navbar";

export default function AdminPage() {
    const [serverStatus, setServerStatus] = useState<any>(null);

    useEffect(() => {
        // Emit an event to request server status from the WebSocket server.
        socket.emit("SERVER_STATUS");

        // Handler to update state when server status is received.
        const handleServerStatus = (data: any) => {
            console.log("Received server status:", data);
            setServerStatus(data);
        };

        // Listen for the "SERVER_STATUS" event.
        socket.on("SERVER_STATUS", handleServerStatus);

        // Cleanup the event listener on unmount.
        return () => {
            socket.off("SERVER_STATUS", handleServerStatus);
        };
    }, []);

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            <Navbar />
            <div className="container mx-auto py-8 px-4">
                <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">
                    Admin Page
                </h1>
                {serverStatus ? (
                    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                        <p className="text-xl font-medium mb-3 text-gray-900 dark:text-gray-100">
                            Server Online:{" "}
                            <span className="font-bold">
                                {serverStatus.online ? "Yes" : "No"}
                            </span>
                        </p>
                        <p className="mb-2 text-gray-800 dark:text-gray-200">
                            <strong>Players Online:</strong> {serverStatus.players_online}
                        </p>
                        <p className="mb-2 text-gray-800 dark:text-gray-200">
                            <strong>Max Players:</strong> {serverStatus.players_max}
                        </p>
                        <p className="mb-2 text-gray-800 dark:text-gray-200">
                            <strong>Bukkit Version:</strong> {serverStatus.bukkit_version}
                        </p>
                        <p className="mb-2 text-gray-800 dark:text-gray-200">
                            <strong>TPS:</strong>{" "}
                            {serverStatus.tps ? serverStatus.tps.join(", ") : "N/A"}
                        </p>
                    </div>
                ) : (
                    <p className="text-xl text-gray-800 dark:text-gray-200">
                        Loading server status...
                    </p>
                )}
            </div>
        </div>
    );
}

