"use client";

import { useEffect } from "react";
import Image from "next/image";
import { MdClose } from "react-icons/md";

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
}

export default function ImageModal({
  isOpen,
  onClose,
  imageUrl,
}: ImageModalProps) {
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscapeKey);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
      document.body.style.overflow = "auto";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative max-w-full max-h-full"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-2 top-2 z-10 rounded-full bg-black bg-opacity-50 p-2 text-white hover:bg-opacity-70 transition-all"
          aria-label="Close"
        >
          <MdClose size={24} />
        </button>

        <div className="relative">
          <Image
            src={imageUrl}
            alt="Imagem ampliada"
            width={800}
            height={800}
            className="max-h-[90vh] max-w-[90vw] object-contain rounded"
            style={{ maxHeight: "90vh", maxWidth: "90vw" }}
            priority
            quality={100}
          />
        </div>
      </div>
    </div>
  );
}
