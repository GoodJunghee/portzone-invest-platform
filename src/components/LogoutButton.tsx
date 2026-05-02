"use client";

import { useRouter } from "next/navigation";

export function LogoutButton({
  variant = "secondary",
  className,
}: {
  variant?: "primary" | "secondary";
  className?: string;
}) {
  const router = useRouter();
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }
  const defaultCls =
    variant === "primary"
      ? "btn-primary !py-2 !px-3 text-xs"
      : "btn-secondary !py-2 !px-3 text-xs";
  return (
    <button onClick={logout} className={className ?? defaultCls}>
      로그아웃
    </button>
  );
}
