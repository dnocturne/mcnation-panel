import { Button } from "@/components/ui/button";
import { NavigationMenuDemo } from "@/components/navbar";
import { DiscordWidget } from "@/components/discord-widget";
import { ServerMonitor } from "@/components/server-monitor";
import { Shield, Users, Award, Sword, Rocket, Globe } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

export default function HeroSectionGradientBackground() {
	return (
		<div className="snap-y snap-mandatory h-screen overflow-y-scroll">
			<section className="snap-start h-screen w-full relative">
				<NavigationMenuDemo />
				<main className="flex min-h-screen items-center relative overflow-hidden">
					{/* Hero */}
					<div className="relative w-full py-24 lg:py-32">
						{/* Gradients */}
						<div
							aria-hidden="true"
							className="absolute inset-0 w-full h-screen"
						>
							<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
								<div className="relative">
									<div className="absolute bg-gradient-to-r from-background/50 to-background blur-3xl w-[40rem] h-[40rem] rotate-[-60deg] transform -translate-x-[15rem] opacity-70" />
									<div className="absolute bg-gradient-to-tl from-primary-foreground via-primary-foreground to-background blur-3xl w-[100rem] h-[100rem] rounded-full opacity-50" />
								</div>
							</div>
						</div>
						{/* End Gradients */}
						<div className="relative z-10">
							<div className="container mx-auto px-4 sm:px-6 lg:px-8">
								<div className="max-w-2xl text-center mx-auto">
									<p className="text-lg font-semibold">MCNATION.lt</p>
									{/* Title */}
									<div className="mt-5 max-w-2xl">
										<h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
											Survival Minecraft Server
										</h1>
									</div>
									{/* End Title */}
									<div className="mt-5 max-w-3xl">
										<p className="text-xl text-muted-foreground">
											Survival Minecraft Server
										</p>
									</div>
									{/* Buttons */}
									<div className="mt-8 space-y-4 flex flex-col items-center">
										<div className="flex gap-3">
											<Button size={"lg"}>Get started</Button>
											<Button size={"lg"} variant={"outline"}>
												Learn more
											</Button>
										</div>
										<div className="w-full max-w-sm space-y-2">
											<ServerMonitor />
											<DiscordWidget />
										</div>
									</div>
									{/* End Buttons */}
								</div>
							</div>
						</div>
					</div>
					{/* End Hero */}
				</main>
			</section>

			{/* Server Features Section */}
			<section className="snap-start h-screen w-full flex flex-col justify-center bg-accent/30">
				<div className="container mx-auto px-4">
					<div className="text-center mb-6">
						<h2 className="text-4xl font-bold mb-3">Server Features</h2>
						<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
							Discover what makes our Minecraft server unique and exciting for
							all players
						</p>
					</div>

					<div className="grid grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
						{/* Feature cards - simplified design */}
						<div className="bg-card/80 backdrop-blur-sm border border-primary/20 rounded-lg p-4 flex flex-col items-center text-center">
							<div className="p-2 rounded-full bg-primary/10 mb-3">
								<Shield className="h-6 w-6 text-primary" />
							</div>
							<h3 className="text-base font-bold mb-1">Protected Land</h3>
							<p className="text-sm text-muted-foreground">
								Claim and protect your builds with our advanced land protection
								system.
							</p>
						</div>

						<div className="bg-card/80 backdrop-blur-sm border border-primary/20 rounded-lg p-4 flex flex-col items-center text-center">
							<div className="p-2 rounded-full bg-primary/10 mb-3">
								<Users className="h-6 w-6 text-primary" />
							</div>
							<h3 className="text-base font-bold mb-1">Active Community</h3>
							<p className="text-sm text-muted-foreground">
								Join a friendly community of players ready to help and
								collaborate.
							</p>
						</div>

						<div className="bg-card/80 backdrop-blur-sm border border-primary/20 rounded-lg p-4 flex flex-col items-center text-center">
							<div className="p-2 rounded-full bg-primary/10 mb-3">
								<Award className="h-6 w-6 text-primary" />
							</div>
							<h3 className="text-base font-bold mb-1">Custom Ranks</h3>
							<p className="text-sm text-muted-foreground">
								Progress through our unique rank system and unlock special
								abilities.
							</p>
						</div>

						<div className="bg-card/80 backdrop-blur-sm border border-primary/20 rounded-lg p-4 flex flex-col items-center text-center">
							<div className="p-2 rounded-full bg-primary/10 mb-3">
								<Sword className="h-6 w-6 text-primary" />
							</div>
							<h3 className="text-base font-bold mb-1">PVP Arenas</h3>
							<p className="text-sm text-muted-foreground">
								Test your combat skills in dedicated arenas with special events.
							</p>
						</div>

						<div className="bg-card/80 backdrop-blur-sm border border-primary/20 rounded-lg p-4 flex flex-col items-center text-center">
							<div className="p-2 rounded-full bg-primary/10 mb-3">
								<Rocket className="h-6 w-6 text-primary" />
							</div>
							<h3 className="text-base font-bold mb-1">
								Performance Optimized
							</h3>
							<p className="text-sm text-muted-foreground">
								Experience smooth gameplay with minimal lag even during peak
								times.
							</p>
						</div>

						<div className="bg-card/80 backdrop-blur-sm border border-primary/20 rounded-lg p-4 flex flex-col items-center text-center">
							<div className="p-2 rounded-full bg-primary/10 mb-3">
								<Globe className="h-6 w-6 text-primary" />
							</div>
							<h3 className="text-base font-bold mb-1">Regular Events</h3>
							<p className="text-sm text-muted-foreground">
								Participate in server events, from build competitions to
								treasure hunts.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* Community Section */}
			<section className="snap-start h-screen w-full">
				<div className="container mx-auto px-4 py-16 pt-28 h-full flex flex-col justify-start overflow-y-auto">
					<div className="text-center mb-12">
						<h2 className="text-4xl font-bold mb-4">Join Our Community</h2>
						<p className="text-xl text-muted-foreground max-w-2xl mx-auto">
							Become part of a growing community of passionate Minecraft players
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
						<div className="space-y-6">
							<div className="relative overflow-hidden rounded-lg shadow-lg border border-primary/20 aspect-video">
								<div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-background/30 backdrop-blur-sm flex items-center justify-center">
									<p className="text-2xl font-bold">Server Tour Video</p>
								</div>
							</div>
							<p className="text-muted-foreground text-center">
								Check out our server tour video to see what awaits you on
								MCNATION.lt
							</p>
						</div>

						<div className="space-y-8">
							<div className="space-y-4">
								<h3 className="text-2xl font-bold">How to Join</h3>
								<ul className="space-y-3">
									<li className="flex items-start gap-3">
										<span className="bg-primary/10 text-primary font-bold rounded-full w-6 h-6 flex items-center justify-center mt-0.5">
											1
										</span>
										<p>Register an account on our website</p>
									</li>
									<li className="flex items-start gap-3">
										<span className="bg-primary/10 text-primary font-bold rounded-full w-6 h-6 flex items-center justify-center mt-0.5">
											2
										</span>
										<p>
											Connect to our server using the IP:{" "}
											<span className="font-mono bg-muted px-2 py-1 rounded">
												play.mcnation.lt
											</span>
										</p>
									</li>
									<li className="flex items-start gap-3">
										<span className="bg-primary/10 text-primary font-bold rounded-full w-6 h-6 flex items-center justify-center mt-0.5">
											3
										</span>
										<p>Join our Discord community for support and updates</p>
									</li>
								</ul>
							</div>

							<div className="flex justify-center pt-4">
								<Link href="/store">
									<Button size="lg" className="w-full max-w-sm">
										Visit our Store
									</Button>
								</Link>
							</div>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
}
