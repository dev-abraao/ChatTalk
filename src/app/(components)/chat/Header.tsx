'use client';

import { useState } from "react";
import LogoutBtn from "../auth/LogoutBtn";
import EditProfileModal from "./EditProfileModal";
import TranslationSettingsModal from "./TranslationSettingsModal";

const Header = () => {
  const [isTranslationModalOpen, setIsTranslationModalOpen] = useState(false);

  return (
    <div className="fixed flex flex-row shadow-sm shadow-slate-600 justify-between items-center w-full z-30  m-0 p-2 px-4 sm:p-[7px] sm:px-8 md:px-12 lg:px-20 bg-[#7A80DA] text-white">
      <div></div>
      <h5 className="title text-[35px] cursor-pointer font-semibold truncate">
        ChatTalk!
      </h5>
      <div className="flex flex-row gap-1 sm:gap-2 items-center flex-shrink-0">
        <button
          onClick={() => setIsTranslationModalOpen(true)}
          className="p-2 rounded-lg text-sm transition-colors cursor-pointer flex items-center gap-1"
          title="Configurações de Tradução"
        >
          🌐
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
