'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getRoomById } from '@/(actions)/room';

interface Room {
  id: string;
  name: string;
  description: string | null;
  created_at: Date;
  owner_id: string;
}

export default function CurrentRoomIndicator() {
  const params = useParams();
  const roomId = params?.roomId as string;
  const [room, setRoom] = useState<Room | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!roomId) {
      setRoom(null);
      return;
    }

    const fetchRoom = async () => {
      setIsLoading(true);
      try {
        const roomData = await getRoomById(roomId);
        setRoom(roomData);
      } catch (error) {
        console.error('Erro ao buscar dados da sala:', error);
        setRoom(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoom();
  }, [roomId]);

  if (!roomId || !room) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-gray-600">
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        <span className="text-xs">Carregando...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-gray-800">
      <div className="w-2 h-2 bg-green-400 rounded-full" />
      <span className="text-xs font-medium truncate max-w-[120px]">
        {room.name}
      </span>
    </div>
  );
}
