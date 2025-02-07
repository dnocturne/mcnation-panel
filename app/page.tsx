import { Button } from "@/components/ui/button";
import Navbar from "@/components/navbar";

export default function HeroSectionGradientBackground() {
  return (
    <>
      <Navbar />
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
                  <div className="mt-4">
                  </div>
                </div>
                {/* Buttons */}
                <div className="mt-8 gap-3 flex justify-center">
                  <Button size={"lg"}>Get started</Button>
                  <Button size={"lg"} variant={"outline"}>
                    Learn more
                  </Button>
                </div>
                {/* End Buttons */}
              </div>
            </div>
          </div>
        </div>
        {/* End Hero */}
      </main>
    </>
  );
}
