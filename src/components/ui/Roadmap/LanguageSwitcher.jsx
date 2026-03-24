import React from "react";
import { motion } from "framer-motion";

const LanguageSwitcher = ({ currentLang, setLang }) => {
  const langs = [
    { id: "en", label: "English" },
    { id: "bn", label: "বাংলা" }
  ];

  return (
    <div className="flex gap-2 p-1 bg-white/5 border border-white/10 rounded-full w-fit">
      {langs.map((lang) => (
        <button
          key={lang.id}
          onClick={() => setLang(lang.id)}
          className={`px-4 py-1 rounded-full text-[10px] font-bold transition-all ${
            currentLang === lang.id 
            ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" 
            : "text-white/30 hover:text-white/60"
          }`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;