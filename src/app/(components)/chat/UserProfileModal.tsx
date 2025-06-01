"use client";

import { useState, useEffect } from "react";
import { UserProfile } from "@/(lib)/definitions";
import { getProfileByUsername } from "@/(actions)/user";
import Image from "next/image";

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  userImageUrl: string | null;
}

export default function UserProfileModal({
  isOpen,
  onClose,
  username,
  userImageUrl,
}: UserProfileModalProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen && username) {
      const fetchUserProfile = async () => {
        setIsLoading(true);
        try {
          const userProfile = await getProfileByUsername(username);
          setProfile(userProfile);
        } catch (error) {
          console.error("Erro ao buscar perfil do usuário:", error);
          // Fallback para dados básicos se houver erro
          setProfile({
            username: username,
            bio: "",
            image_url: userImageUrl,
          });
        } finally {
          setIsLoading(false);
        }
      };

      fetchUserProfile();
    }
  }, [isOpen, username, userImageUrl]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 bg-black/50 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fadeIn">
        <div className="bg-[#7A80DA] text-white p-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Perfil do Usuário</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-[#7A80DA] rounded-full border-t-transparent"></div>
            </div>
          ) : (
            <>
              {/* Profile Image Section */}
              <div className="flex flex-col items-center mb-6">
                <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden mb-3 border-2 border-[#7A80DA]">
                  {profile?.image_url ? (
                    <Image
                      src={profile.image_url}
                      width={96}
                      height={96}
                      alt={`Avatar de ${profile.username}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-10 h-10"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              </div>

              {/* Username */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome de usuário
                </label>
                <div className="w-full text-black rounded-lg border border-gray-300 p-3 bg-gray-50">
                  {profile?.username || "Usuário"}
                </div>
              </div>

              {/* Bio */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                <div className="w-full text-black rounded-lg border border-gray-300 p-3 bg-gray-50 min-h-[80px]">
                  {profile?.bio || "Nenhuma bio disponível"}
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Fechar
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
