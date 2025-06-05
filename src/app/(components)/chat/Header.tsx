'use client';

import { useState } from "react";
import LogoutBtn from "../auth/LogoutBtn";
import EditProfileModal from "./EditProfileModal";
import TranslationSettingsModal from "./TranslationSettingsModal";

const Header = () => {
  const [isTranslationModalOpen, setIsTranslationModalOpen] = useState(false);

  return (
    <div className="flex flex-row justify-between items-center m-0 p-2 px-4 sm:p-[7px] sm:px-8 md:px-12 lg:px-20 bg-[#7A80DA] text-white">
      <h5 className="title text-[20px] sm:text-[24px] md:text-[28px] lg:text-[35px] cursor-pointer font-semibold truncate">
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
