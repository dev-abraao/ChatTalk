"use client";
import { useState, useEffect, useRef } from "react";
import { useActionState } from "react";
import { updateProfile } from "@/(actions)/user";
import { UserProfile } from "@/(lib)/definitions";
import { getProfile } from "@/(actions)/user";
import { FiUser } from "react-icons/fi";
import Image from "next/image";

export default function EditProfileModal() {
  const [showModal, setShowModal] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [state, action, pending] = useActionState(updateProfile, undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openModal = () => {
    setShowModal(!showModal);
  };

  const fetchProfile = () => {
    getProfile().then((data) => {
      setProfile(data);
      if (data?.image_url) {
        setImagePreview(data.image_url);
      }
    });
  };

  useEffect(() => {
    if (state?.data && state.data.success) {
      setShowModal(false);
      fetchProfile();
    } else {
      fetchProfile();
    }
  }, [state]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      console.log("Selected file:", selectedImage);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <button
        onClick={openModal}
        className="bg-[#7A80DA] hover:bg-[#5a62ce] text-white font-bold py-2 px-4 rounded-lg"
      >
        <FiUser className="" />
      </button>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center p-4 bg-black/50 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fadeIn">
            <div className="bg-[#7A80DA] text-white p-4">
              <h2 className="text-xl font-semibold text-center">
                Editar Perfil
              </h2>
            </div>
            <form action={action} className="p-6">
              {/* Profile Image Section */}
              <div className="flex flex-col items-center mb-6">
                <div
                  className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden mb-3 cursor-pointer border-2 border-[#7A80DA]"
                  onClick={triggerFileInput}
                >
                  {imagePreview ? (
                    <Image
                      src={imagePreview}
                      width={96}
                      height={96}
                      alt="Preview"
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
                <input
                  type="file"
                  name="image"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  className="hidden"
                />
                <input
                  type="hidden"
                  name="image_url"
                  value={imagePreview || profile?.image_url || ""}
                />
                <p className="text-sm text-gray-500">
                  Clique para alterar sua foto
                </p>
              </div>

              {/* Username Field */}
              <div className="mb-4">
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Nome de usuário
                </label>
                <input
                  type="text"
                  name="username"
                  id="username"
                  defaultValue={profile?.username}
                  placeholder="Digite seu nome de usuário"
                  maxLength={20}
                  className={`w-full text-black rounded-lg border p-3 focus:outline-none focus:ring-2 focus:ring-[#7A80DA] transition-all
                  ${
                    state?.errors?.username
                      ? "border-red-500 text-red-500 placeholder-red-500"
                      : "border-gray-300"
                  }`}
                />
                {state?.errors?.username && (
                  <p className="mt-1 text-sm text-red-500">
                    {state.errors.username}
                  </p>
                )}
              </div>

              {/* Bio Field */}
              <div className="mb-4">
                <label
                  htmlFor="bio"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Bio
                </label>
                <textarea
                  name="bio"
                  id="bio"
                  rows={3}
                  defaultValue={profile?.bio || ""}
                  placeholder="Conte um pouco sobre você"
                  className={`w-full text-black rounded-lg border p-3 focus:outline-none focus:ring-2 focus:ring-[#7A80DA] transition-all resize-none
                  ${
                    state?.errors?.bio
                      ? "border-red-500 text-red-500 placeholder-red-500"
                      : "border-gray-300"
                  }`}
                />
                {state?.errors?.bio && (
                  <p className="mt-1 text-sm text-red-500">
                    {state.errors.bio}
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={openModal}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={pending}
                  className="bg-[#7A80DA] hover:bg-[#5a62ce] text-white font-medium px-4 py-2 rounded-lg transition-colors 
                  disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {pending ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
