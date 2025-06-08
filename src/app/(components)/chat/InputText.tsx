"use client";

import { useState, useRef } from "react";
import { useMessages } from "@ably/chat";
import { FiSend, FiPaperclip } from "react-icons/fi";
import { getUserId, getProfile } from "@/(actions)/user";
import { saveMessage } from "@/(actions)/message";
import { useParams } from "next/navigation";
import CharacterCounter from "./CharacterCounter";
import { getFileUploadUrl } from "@/(actions)/minio";
import { isFileTypeSupported, getFileType } from "@/(lib)/fileUtils";
import { v4 as uuidv4 } from "uuid";

function InputText() {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { send } = useMessages();
  const MAX_LENGTH = 150;
  const COOLDOWN_TIME = 500;
  const params = useParams();
  const roomId = params?.roomId as string;
  const handleSendMessage = async (
    e: React.FormEvent,
    fileUrl?: string,
    fileType?: "image" | "video"
  ) => {
    e.preventDefault();

    if ((message.trim() === "" && !fileUrl) || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const userProfile = await getProfile();
      const username = userProfile?.username;
      const userImageUrl = userProfile?.image_url;
      const userId = await getUserId();

      if (!username || !userId) {
        console.error("Username ou userId não encontrado");
        return;
      }

      if (fileUrl) {
        const isVideo = fileType === "video";
        const displayText = message || (isVideo ? "🎥 Vídeo" : "📷 Imagem");

        send({
          text: displayText,
          metadata: {
            username,
            imageUrl: fileUrl,
            fileUrl,
            fileType,
            userImageUrl,
          },
        });
      } else {
        send({
          text: message,
          metadata: { username, userImageUrl },
        });
      }
      if (roomId) {
        const isVideo = fileType === "video";
        const displayText =
          message || (fileUrl ? (isVideo ? "🎥 Vídeo" : "📷 Imagem") : "");

        await saveMessage({
          content: displayText,
          roomId,
          userId: userId as string,
          fileUrl,
          type: fileUrl ? fileType || "image" : "text",
        });
      }
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
    }

    setMessage("");

    setTimeout(() => {
      setIsSubmitting(false);
    }, COOLDOWN_TIME);
  };
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isFileTypeSupported(file.type)) {
      alert(
        "Tipo de arquivo não suportado. Por favor, selecione uma imagem (JPG, PNG, GIF, WebP) ou vídeo (MP4, WebM, MOV)."
      );
      return;
    }

    const maxSize = file.type.startsWith("video/")
      ? 50 * 1024 * 1024
      : 5 * 1024 * 1024;
    if (file.size > maxSize) {
      const maxSizeText = file.type.startsWith("video/") ? "50MB" : "5MB";
      alert(
        `O arquivo é muito grande. Por favor, selecione um arquivo menor que ${maxSizeText}.`
      );
      return;
    }
    setIsUploading(true);
    try {
      const fileType = getFileType(file.type);

      const buffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(buffer);
      const bufferArray = Array.from(uint8Array);

      const fileData = {
        buffer: bufferArray,
        originalname: file.name,
        mimetype: file.type,
        size: file.size,
      };

      const messageId = uuidv4();

      const result = await getFileUploadUrl(fileData, file.type, messageId);

      if (result?.fileUrl) {
        const event = new CustomEvent("submit") as unknown as React.FormEvent;
        await handleSendMessage(event, result.fileUrl, fileType);
      }
    } catch (error) {
      console.error("Erro ao fazer upload do arquivo:", error);
      alert("Falha ao enviar o arquivo. Por favor, tente novamente.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <form onSubmit={(e) => handleSendMessage(e)} className="flex gap-2">
      {/* Input escondido para seleção de arquivo */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*,video/*"
        className="hidden"
      />

      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className={`px-3 rounded-lg transition-colors flex items-center justify-center ${
          isUploading
            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
            : "bg-gray-100 hover:bg-gray-200 text-gray-600"
        }`}
      >
        <FiPaperclip size={20} />
      </button>

      <div className="flex-1 relative">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={
            isUploading ? "Enviando arquivo..." : "Digite sua mensagem..."
          }
          maxLength={MAX_LENGTH}
          disabled={isUploading}
          className={`w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7A80DA] focus:border-transparent ${
            isUploading ? "bg-gray-100 text-gray-500" : ""
          }`}
        />
        <CharacterCounter text={message} maxLength={MAX_LENGTH} />
      </div>

      <button
        type="submit"
        disabled={isSubmitting || isUploading}
        className={`px-4 py-2 rounded-lg transition-colors flex items-center justify-center ${
          isSubmitting || isUploading
            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
            : "bg-[#7A80DA] text-white hover:bg-[#6269c5]"
        }`}
      >
        <FiSend size={20} />
      </button>
    </form>
  );
}

export default InputText;
