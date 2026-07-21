"use client";

import { useState } from "react";
import { shareAppLink } from "@/lib/share";
import { InviteFriendsIcon, CheckIcon } from "./icons";

export function ShareAppButton() {
  const [isLinkCopied, setIsLinkCopied] = useState(false);

  async function handleClick() {
    const result = await shareAppLink();
    if (result === "copied") {
      setIsLinkCopied(true);
      setTimeout(() => setIsLinkCopied(false), 2000);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      title={isLinkCopied ? "Посилання скопійовано" : "Розкажи про нас друзям"}
      aria-label={
        isLinkCopied ? "Посилання скопійовано" : "Розкажи про нас друзям"
      }
      className="flex h-11 w-11 items-center justify-center rounded-full border border-zinc-900 text-zinc-900 hover:bg-zinc-900 hover:text-white dark:border-zinc-100 dark:text-zinc-100 dark:hover:bg-zinc-100 dark:hover:text-zinc-900"
    >
      {isLinkCopied ? <CheckIcon /> : <InviteFriendsIcon />}
    </button>
  );
}
