import TransitionLink from "@/components/ui/TransitionLink";

export default function NotFound() {
  return (
    <main id="main" className="container-x flex min-h-svh flex-col items-center justify-center text-center">
      <p className="text-gradient text-[clamp(6rem,20vw,12rem)] font-extrabold leading-none tracking-tight">404</p>
      <h1 className="mt-4 text-3xl font-extrabold text-paper">This page drifted out of orbit</h1>
      <p className="mt-3 max-w-md text-mute">The page you’re looking for doesn’t exist or has moved.</p>
      <TransitionLink href="/" transitionLabel="Home" className="btn btn-primary mt-8">
        Back to home
      </TransitionLink>
    </main>
  );
}
