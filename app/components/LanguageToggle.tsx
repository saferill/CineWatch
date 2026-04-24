"use client";

import { useState, useEffect } from "react";
import { IconLanguage } from "@tabler/icons-react";

export default function LanguageToggle() {
  const [lang, setLang] = useState("en-US");

  useEffect(() => {
    const saved = localStorage.getItem("cinewatch_lang") || "en-US";
    setLang(saved);
  }, []);

  const toggle = () => {
    const next = lang === "en-US" ? "id-ID" : "en-US";
    setLang(next);
    localStorage.setItem("cinewatch_lang", next);
    // Force reload to apply language change globally
    window.location.reload();
  };

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass text-[10px] font-bold text-zinc-400 hover:text-white transition-colors"
      title="Change Language"
    >
      <IconLanguage className="w-3.5 h-3.5" stroke={2} />
      {lang === "en-US" ? "EN" : "ID"}
    </button>
  );
}
