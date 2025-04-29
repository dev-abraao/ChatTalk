"use client";

import { useState, useRef } from "react";
import { useMessages } from "@ably/chat";
import { FiSend, FiPaperclip } from "react-icons/fi";
import { fetchUsername, getUserId } from "@/(actions)/user";
import { saveMessage } from "@/(actions)/message";
import { useParams } from "next/navigation";
import CharacterCounter from "./CharacterCounter";
import { getImageUploadUrl } from "@/(actions)/minio";
import { v4 as uuidv4 } from 'uuid';

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

  const handleSendMessage = async (e: React.FormEvent, imageUrl?: string) => {
    e.preventDefault();

    if ((message.trim() === "" && !imageUrl) || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const username = await fetchUsername();
      const userId = await getUserId();

      if (!username || !userId) {
        console.error("Username ou userId não encontrado");
        return;
      }

      // Se tivermos uma imagem, envie a mensagem com metadados de imagem
      if (imageUrl) {
        send({
          text: message || "📷 Imagem",
          metadata: { username, imageUrl },
        });
      } else {
        send({
          text: message,
          metadata: { username },
        });
      }

      if (roomId) {
        await saveMessage({
          content: message || (imageUrl ? "📷 Imagem" : ""),
          roomId,
          userId: userId as string,
          imageUrl,
          type: imageUrl ? "image" : "text"
        });
        console.log("Mensagem salva no banco de dados");
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

    // Verificar tipo de arquivo (apenas imagens)
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione apenas arquivos de imagem.');
      return;
    }

    // Verificar tamanho (limitar a 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('O arquivo é muito grande. Por favor, selecione uma imagem menor que 5MB.');
      return;
    }

    setIsUploading(true);

    try {
      // Ler o arquivo como buffer
      const buffer = await file.arrayBuffer();
      const fileData = {
        buffer: Buffer.from(buffer),
        originalname: file.name,
        mimetype: file.type,
        size: file.size
      };

      // Gerar ID único para a mensagem
      const messageId = uuidv4();

      // Fazer upload para o MinIO
      const result = await getImageUploadUrl(fileData, file.type, messageId);
      
      if (result?.imageUrl) {
        // Criar um evento sintético para evitar problemas com preventDefault()
        const event = new CustomEvent('submit') as unknown as React.FormEvent;
        await handleSendMessage(event, result.imageUrl);
      }
    } catch (error) {
      console.error("Erro ao fazer upload da imagem:", error);
      alert("Falha ao enviar a imagem. Por favor, tente novamente.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <form
      onSubmit={(e) => handleSendMessage(e)}
      className="flex gap-2"
    >
      {/* Input escondido para seleção de arquivo */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      
      {/* Botão de clipe para upload de imagem */}
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className={`px-3 rounded-lg transition-colors flex items-center justify-center ${
          isUploading
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
        }`}
      >
        <FiPaperclip size={20} />
      </button>
      
      <div className="flex-1 relative">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={isUploading ? "Enviando imagem..." : "Digite sua mensagem..."}
          maxLength={MAX_LENGTH}
          disabled={isUploading}
          className={`w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7A80DA] focus:border-transparent ${
            isUploading ? 'bg-gray-100 text-gray-500' : ''
          }`}
        />
        <CharacterCounter text={message} maxLength={MAX_LENGTH} />
      </div>
      
      <button
        type="submit"
        disabled={isSubmitting || isUploading}
        className={`px-4 py-2 rounded-lg transition-colors flex items-center justify-center ${
          isSubmitting || isUploading
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-[#7A80DA] text-white hover:bg-[#6269c5]'
        }`}
      >
        <FiSend size={20} />
      </button>
    </form>
  );
}

export default InputText;
