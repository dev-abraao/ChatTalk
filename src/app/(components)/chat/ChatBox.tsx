"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useMessages } from "@ably/chat";
import { getProfile } from "@/(actions)/user";
import { getMessagesByRoomId } from "@/(actions)/message";
import { useParams } from "next/navigation";
import Image from "next/image";
import ImageModal from "./ImageModal";
import VideoModal from "./VideoModal";
import UserProfileModal from "./UserProfileModal";

interface ChatMessage {
  id?: string;
  text: string;
  metadata?: {
    username?: string;
    imageUrl?: string;
    fileUrl?: string;
    fileType?: "image" | "video";
    userImageUrl?: string | null;
  };
  timestamp?: Date | number;
}

interface DbMessage {
  id: string;
  content: string;
  username: string;
  createdAt: Date;
  imageUrl?: string | null;
  type?: string;
  userImageUrl?: string | null;
}

function ChatBox() {
  const [receivedMessages, setReceivedMessages] = useState<ChatMessage[]>([]);
  const [dbMessages, setDbMessages] = useState<DbMessage[]>([]);
  const [myUsername, setMyUsername] = useState<string | null>(null);
  const [ImageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAutoScroll, setIsAutoScroll] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [isUserProfileModalOpen, setIsUserProfileModalOpen] = useState(false);
  const [selectedUserProfile, setSelectedUserProfile] = useState<{
    username: string;
    userImageUrl: string | null;
  } | null>(null);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const params = useParams() || {};
  const roomId = params.roomId as string;

  useEffect(() => {
    const getUsername = async () => {
      const user = await getProfile();

      if (!user) {
        console.error("Usuário não encontrado");
        return;
      }

      setMyUsername(user.username);
      setImageUrl(user.image_url);
      console.log(ImageUrl)
    };
    getUsername();
  }, [ImageUrl]);

  useEffect(() => {
    if (roomId) {
      const loadMessages = async () => {
        try {
          const messages = await getMessagesByRoomId(roomId);
          if (messages && Array.isArray(messages)) {
            setDbMessages(messages);
          }
        } catch (error) {
          console.error("Erro ao carregar mensagens:", error);
        } finally {
          setIsLoading(false);
        }
      };

      loadMessages();
    }
  }, [roomId]);

  useMessages({
    listener: (event: { message: ChatMessage }) => {
      setReceivedMessages((prev) => [...prev, event.message]);
    },
  });

  const allMessages = useMemo(() => {
    const combined = [
      ...dbMessages.map((msg) => ({
        id: msg.id,
        text: msg.content,
        metadata: {
          username: msg.username,
          imageUrl: msg.imageUrl,
          fileUrl: msg.imageUrl,
          fileType: (msg.type === "video" ? "video" : "image") as
            | "image"
            | "video",
          userImageUrl: msg.userImageUrl || null,
        },
        timestamp: new Date(msg.createdAt).getTime(),
        type: msg.type || "text",
      })),
      ...receivedMessages.map((msg) => ({
        ...msg,
        id: msg.id || `${Date.now()}-${Math.random()}`,
        timestamp: msg.timestamp
          ? new Date(msg.timestamp).getTime()
          : Date.now(),
        type: msg.metadata?.fileUrl
          ? msg.metadata?.fileType || "image"
          : msg.metadata?.imageUrl
          ? "image"
          : "text",
      })),
    ];

    const uniqueMessages = combined.filter(
      (v, i, a) => a.findIndex((t) => t.id === v.id) === i
    );

    return uniqueMessages.sort(
      (a, b) => (a.timestamp || 0) - (b.timestamp || 0)
    );
  }, [dbMessages, receivedMessages]);
  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  }, []);

  const handleUserImageClick = (
    username: string,
    userImageUrl: string | null
  ) => {
    if (username === myUsername) {
      return;
    }
    setSelectedUserProfile({ username, userImageUrl });
    setIsUserProfileModalOpen(true);
  };

  const closeUserProfileModal = () => {
    setIsUserProfileModalOpen(false);
    setSelectedUserProfile(null);
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      setIsAutoScroll(scrollHeight - (scrollTop + clientHeight) < 50);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isAutoScroll) {
      const isNewMessage = allMessages.length > dbMessages.length;
      scrollToBottom(isNewMessage ? "smooth" : "auto");
    }
  }, [allMessages, isAutoScroll, scrollToBottom, dbMessages.length]);

  return (
    <div className="flex-1 overflow-hidden">
      <div
        ref={scrollContainerRef}
        className="h-full p-4 overflow-y-auto space-y-4"
      >
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin h-8 w-8 border-4 border-[#7A80DA] rounded-full border-t-transparent"></div>
          </div>
        ) : allMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="bg-gray-50 p-5 rounded-full mb-4">
              <span className="text-gray-300 text-5xl">💬</span>
            </div>
            <h3 className="text-lg font-medium text-gray-500 mb-1">
              Nenhuma mensagem ainda
            </h3>
            <p className="text-gray-400 text-sm">
              Seja o primeiro a enviar uma mensagem!
            </p>
          </div>
        ) : (
          allMessages.map((msg) => {
            const isMyMessage = msg.metadata?.username === myUsername;
            const hasMedia =
              msg.metadata?.imageUrl ||
              msg.metadata?.fileUrl ||
              msg.type === "image" ||
              msg.type === "video";
            const fileUrl = msg.metadata?.fileUrl || msg.metadata?.imageUrl;
            const fileType =
              msg.metadata?.fileType ||
              (msg.type === "video" ? "video" : "image");
            const userImageUrl = msg.metadata?.userImageUrl;
            return (
              <div
                key={msg.id}
                className={
                  isMyMessage ? "flex justify-end" : "flex justify-start"
                }
              >
                {!isMyMessage && (
                  <div className="flex-shrink-0 mr-2">
                    {userImageUrl ? (
                      <Image
                        src={userImageUrl}
                        width={32}
                        height={32}
                        alt={`Avatar de ${msg.metadata?.username || "Usuário"}`}
                        className="w-8 h-8 rounded-full object-cover border-2 border-gray-200 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() =>
                          handleUserImageClick(
                            msg.metadata?.username || "Usuário",
                            userImageUrl || null
                          )
                        }
                      />
                    ) : (
                      <div
                        className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center border-2 border-gray-200 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() =>
                          handleUserImageClick(
                            msg.metadata?.username || "Usuário",
                            userImageUrl || null
                          )
                        }
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-5 h-5 text-gray-500"
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
                )}{" "}
                <div
                  className={`max-w-[90%] md:max-w-[70%] break-words rounded-lg px-4 py-2 ${
                    isMyMessage && !hasMedia
                      ? "bg-[#7A80DA] text-white"
                      : "bg-white shadow-md"
                  }`}
                >
                  {!isMyMessage && (
                    <div className="text-xs text-[#7A80DA] font-semibold mb-1">
                      {msg.metadata?.username || "Usuário"}
                    </div>
                  )}{" "}
                  {fileUrl && (
                    <div className="mb-2 mt-1">
                      {fileType === "video" ? (
                        <div className="relative">
                          <video
                            src={fileUrl}
                            controls
                            className="max-w-full max-h-64 rounded-md cursor-pointer"
                            preload="metadata"
                            onClick={() => setSelectedVideo(fileUrl)}
                          >
                            Seu navegador não suporta a tag de vídeo.
                          </video>
                          <div
                            className="absolute inset-0 cursor-pointer"
                            onClick={() => setSelectedVideo(fileUrl)}
                          />
                        </div>
                      ) : (
                        <div
                          onClick={() => setSelectedImage(fileUrl)}
                          className="cursor-pointer"
                        >
                          <Image
                            src={fileUrl}
                            width={300}
                            height={300}
                            priority
                            quality={100}
                            placeholder="blur"
                            blurDataURL={fileUrl}
                            alt="Imagem compartilhada"
                            className="max-w-full rounded-md hover:opacity-90 transition-opacity"
                          />
                        </div>
                      )}
                    </div>
                  )}{" "}
                  {msg.text &&
                    (!hasMedia ||
                      (msg.text !== "📷 Imagem" &&
                        msg.text !== "🎥 Vídeo")) && (
                      <div className="text-sm">{msg.text}</div>
                    )}
                </div>
                {isMyMessage && (
                  <div className="flex-shrink-0 ml-2">
                    {userImageUrl ? (
                      <Image
                        src={userImageUrl}
                        width={32}
                        height={32}
                        alt={`Avatar de ${msg.metadata?.username || "Usuário"}`}
                        className="w-8 h-8 rounded-full object-cover border-2 border-gray-200 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() =>
                          handleUserImageClick(
                            msg.metadata?.username || "Usuário",
                            userImageUrl || null
                          )
                        }
                      />
                    ) : (
                      <div
                        className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center border-2 border-gray-200 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() =>
                          handleUserImageClick(
                            msg.metadata?.username || "Usuário",
                            userImageUrl || null
                          )
                        }
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-5 h-5 text-gray-500"
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
                )}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>{" "}
      {/* Image Modal */}
      <ImageModal
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        imageUrl={selectedImage || ""}
      />
      {/* Video Modal */}
      <VideoModal
        isOpen={!!selectedVideo}
        onClose={() => setSelectedVideo(null)}
        videoUrl={selectedVideo || ""}
      />
      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={isUserProfileModalOpen}
        onClose={closeUserProfileModal}
        username={selectedUserProfile?.username || ""}
        userImageUrl={selectedUserProfile?.userImageUrl || null}
      />
    </div>
  );
}

export default ChatBox;
