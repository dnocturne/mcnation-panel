import type { Metadata } from "next";
import LoginForm from "./login-form";

export const metadata: Metadata = {
	title: "Login - MCNation Panel",
	description: "Log into your MCNation Panel account",
};

export default async function LoginPage({
	searchParams,
}: {
	searchParams: Promise<{ redirect?: string }>;
}) {
	const resolvedParams = await searchParams;
	const redirectPath = resolvedParams.redirect || "/";

	return (
		<div className="container mx-auto flex h-screen flex-col items-center justify-center">
			<div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
				<div className="flex flex-col space-y-2 text-center">
					<h1 className="text-2xl font-semibold tracking-tight">
						Welcome back
					</h1>
					<p className="text-sm text-muted-foreground">
						Enter your credentials to sign in to your account
					</p>
				</div>
				<LoginForm redirectPath={redirectPath} />
			</div>
		</div>
	);
}
