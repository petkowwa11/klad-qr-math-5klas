import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import type { VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

type ButtonProps = ComponentProps<typeof Button> & VariantProps<typeof buttonVariants>;

export function LinkButton({
  href,
  target,
  rel,
  ...props
}: Omit<ButtonProps, "render" | "nativeButton"> & {
  href: string;
  target?: string;
  rel?: string;
}) {
  return (
    <Button
      nativeButton={false}
      render={<Link href={href} target={target} rel={rel} />}
      {...props}
    />
  );
}
