"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import AvatarEditor from "react-avatar-editor";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface AvatarUploadProps {
	username: string;
	currentAvatarUrl?: string;
	isEditable?: boolean;
}

export function AvatarUpload({
	username,
	currentAvatarUrl,
	isEditable = false,
}: AvatarUploadProps) {
	const [image, setImage] = useState<File | null>(null);
	const [scale, setScale] = useState([1]);
	const [isOpen, setIsOpen] = useState(false);
	const editorRef = useRef<AvatarEditor>(null);
	const queryClient = useQueryClient();

	const uploadMutation = useMutation({
		mutationFn: async (blob: Blob) => {
			const formData = new FormData();
			formData.append("avatar", blob);

			const response = await fetch(`/api/users/${username}/avatar`, {
				method: "POST",
				body: formData,
			});

			if (!response.ok) {
				throw new Error("Failed to upload avatar");
			}

			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["userProfile", username] });
			queryClient.invalidateQueries({ queryKey: ["avatar", username] });
			setIsOpen(false);
			setImage(null);
		},
	});

	const handleSave = async () => {
		if (editorRef.current && image) {
			const canvas = editorRef.current.getImageScaledToCanvas();
			canvas.toBlob(
				(blob) => {
					if (blob) {
						uploadMutation.mutate(blob);
					}
				},
				"image/jpeg",
				0.95,
			);
		}
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files?.[0]) {
			setImage(e.target.files[0]);
		}
	};

	// Get the avatar source based on whether a custom avatar exists
	const getAvatarSrc = () => {
		if (currentAvatarUrl) {
			// If there's a custom avatar, use it from the public folder with a timestamp to prevent caching
			return `/avatars/${username}.jpg?t=${Date.now()}`;
		}
		// Fallback to Minecraft skin if no custom avatar
		return `https://mc-heads.net/avatar/${username}`;
	};

	// If not editable, just show the avatar without upload functionality
	if (!isEditable) {
		return (
			<Avatar className="h-32 w-32">
				<AvatarImage src={getAvatarSrc()} alt={username} />
				<AvatarFallback>CN</AvatarFallback>
			</Avatar>
		);
	}

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<div className="relative group cursor-pointer">
					<Avatar className="h-32 w-32">
						<AvatarImage src={getAvatarSrc()} alt={username} />
						<AvatarFallback>CN</AvatarFallback>
					</Avatar>
					<div className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
						<span className="text-white text-sm">Change Avatar</span>
					</div>
				</div>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Update Profile Picture</DialogTitle>
				</DialogHeader>
				<div className="space-y-4">
					<input
						type="file"
						accept="image/*"
						onChange={handleFileChange}
						className="w-full"
					/>
					{image && (
						<>
							<div className="flex justify-center">
								<AvatarEditor
									ref={editorRef}
									image={image}
									width={250}
									height={250}
									border={50}
									borderRadius={125}
									color={[0, 0, 0, 0.6]}
									scale={scale[0]}
								/>
							</div>
							<div className="space-y-2">
								<div className="text-sm">Zoom</div>
								<Slider
									value={scale}
									onValueChange={setScale}
									min={1}
									max={3}
									step={0.1}
								/>
							</div>
							<div className="flex justify-end gap-2">
								<Button variant="outline" onClick={() => setIsOpen(false)}>
									Cancel
								</Button>
								<Button
									onClick={handleSave}
									disabled={uploadMutation.isPending}
								>
									{uploadMutation.isPending ? "Saving..." : "Save"}
								</Button>
							</div>
						</>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
