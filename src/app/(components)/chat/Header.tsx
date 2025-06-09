"use client";

import { useState } from "react";
import LogoutBtn from "../auth/LogoutBtn";
import EditProfileModal from "./EditProfileModal";
import TranslationSettingsModal from "./TranslationSettingsModal";

const Header = () => {
  const [isTranslationModalOpen, setIsTranslationModalOpen] = useState(false);

  return (
    <div className="flex fixed flex-row shadow-sm shadow-slate-600 justify-between items-center w-full z-30 m-0 p-4 px-8 lg:px-10 bg-[#7A80DA] text-white border-b border-[#6269c5]">
      <div></div>
      <h5 className="title text-2xl lg:text-5xl cursor-pointer font-semibold truncate">
        ChatTalk!
      </h5>
      <div className="flex flex-row gap-1 sm:gap-2 items-center flex-shrink-0">
        <button
          onClick={() => setIsTranslationModalOpen(true)}
          className="p-2 rounded-lg text-sm transition-colors cursor-pointer flex items-center gap-1 hover:bg-[#5a62ce]"
          title="Configurações de Tradução"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
            <path d="M2 12h20" />
          </svg>
        </button>
        <EditProfileModal />
        <LogoutBtn />
      </div>

      <TranslationSettingsModal
        isOpen={isTranslationModalOpen}
        onClose={() => setIsTranslationModalOpen(false)}
      />
    </div>
  );
};

export default Header;
