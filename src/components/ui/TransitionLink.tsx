"use client";
import Link from "next/link";
import { usePageTransition } from "@/components/layout/PageTransition";

type Props = Omit<React.ComponentProps<typeof Link>, "href"> & { href: string; transitionLabel?: string };

/** next/link that routes through the cinematic page transition. */
export default function TransitionLink({ href, transitionLabel, onClick, children, ...rest }: Props) {
  const { navigate } = usePageTransition();
  return (
    <Link
      href={href}
      {...rest}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        e.preventDefault();
        navigate(href, transitionLabel);
      }}
    >
      {children}
    </Link>
  );
}
