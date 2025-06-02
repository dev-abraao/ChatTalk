"use client";

interface CreateRoomFormProps {
  onOpenCreateRoomModal: () => void;
}

export default function CreateRoomForm({ onOpenCreateRoomModal }: CreateRoomFormProps) {
  return (
    <button
      type="button"
      onClick={onOpenCreateRoomModal}
      className="w-full bg-[#7A80DA] hover:bg-[#5a62ce] text-white font-medium py-2 px-4 rounded transition-colors"
    >
      Criar Sala
    </button>
  );
}
