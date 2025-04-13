"use client";

import { useEffect, useRef, useState } from "react";
import * as skinview3d from "skinview3d";
import { useTheme } from "next-themes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

interface SkinViewerProps {
	username: string;
}

type AnimationType = "none" | "walking" | "running" | "flying";

export function SkinViewer({ username }: SkinViewerProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const viewerRef = useRef<skinview3d.SkinViewer | null>(null);
	const [animationType, setAnimationType] = useState<AnimationType>("walking");
	const [speed, setSpeed] = useState([1]);
	const [zoom, setZoom] = useState([0.9]);
	const { theme } = useTheme();

	useEffect(() => {
		if (!canvasRef.current || viewerRef.current) return;

		// Create the viewer
		const viewer = new skinview3d.SkinViewer({
			canvas: canvasRef.current,
			width: 300,
			height: 400,
		});

		// Load the skin
		viewer.loadSkin(`https://mc-heads.net/skin/${username}`).catch((error) => {
			console.warn("Failed to load skin:", error);
		});

		// Initial settings
		viewer.autoRotate = true;
		viewer.autoRotateSpeed = 1.0;
		viewer.zoom = zoom[0];
		viewer.fov = 70;

		// Set background based on current theme
		if (theme === "dark") {
			viewer.background = 0x1a1a1a; // Darker background for dark mode
		} else {
			viewer.background = 0xf5f5f5; // Light gray for light mode
		}

		viewerRef.current = viewer;

		// Cleanup
		return () => {
			viewer.dispose();
			viewerRef.current = null;
		};
	}, [username, zoom, theme]);

	// Update background when theme changes
	useEffect(() => {
		if (!viewerRef.current) return;

		if (theme === "dark") {
			viewerRef.current.background = 0x1a1a1a; // Darker background for dark mode
		} else {
			viewerRef.current.background = 0xf5f5f5; // Light gray for light mode
		}
	}, [theme]);

	// Handle animation changes
	useEffect(() => {
		if (!viewerRef.current) return;

		const viewer = viewerRef.current;

		switch (animationType) {
			case "walking":
				viewer.animation = new skinview3d.WalkingAnimation();
				break;
			case "running":
				viewer.animation = new skinview3d.RunningAnimation();
				break;
			case "flying":
				viewer.animation = new skinview3d.FlyingAnimation();
				break;
			case "none":
				viewer.animation = null;
				break;
		}

		if (viewer.animation) {
			viewer.animation.speed = speed[0];
		}
	}, [animationType, speed]);

	return (
		<Card>
			<CardHeader>
				<CardTitle>3D Skin View</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="flex justify-center">
					<canvas ref={canvasRef} />
				</div>

				<div className="space-y-4">
					<div className="flex items-center gap-4">
						<span className="min-w-24">Animation:</span>
						<Select
							value={animationType}
							onValueChange={(value: AnimationType) => setAnimationType(value)}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="none">None</SelectItem>
								<SelectItem value="walking">Walking</SelectItem>
								<SelectItem value="running">Running</SelectItem>
								<SelectItem value="flying">Flying</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2">
						<div className="flex items-center gap-4">
							<span className="min-w-24">Speed:</span>
							<Slider
								value={speed}
								onValueChange={setSpeed}
								min={0.1}
								max={3}
								step={0.1}
								className="flex-1"
							/>
						</div>
					</div>

					<div className="space-y-2">
						<div className="flex items-center gap-4">
							<span className="min-w-24">Zoom:</span>
							<Slider
								value={zoom}
								onValueChange={setZoom}
								min={0.5}
								max={1.5}
								step={0.1}
								className="flex-1"
							/>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
