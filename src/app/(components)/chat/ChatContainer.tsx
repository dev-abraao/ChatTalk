"use client";

import { useState } from "react";
import Header from "./Header";
import ChatBox from "./ChatBox";
import InputText from "./InputText";
import ViewRooms from "../rooms/viewRooms";
import CreateRoomModal from "../rooms/createRoomModal";

export default function ChatContainer() {
  const [isCreateRoomModalOpen, setIsCreateRoomModalOpen] = useState(false);
  const [refreshRooms, setRefreshRooms] = useState(0);

  const handleOpenCreateRoomModal = () => {
    setIsCreateRoomModalOpen(true);
  };

  const handleCloseCreateRoomModal = () => {
    setIsCreateRoomModalOpen(false);
  };

  const handleRoomCreated = () => {
    setIsCreateRoomModalOpen(false);
    setRefreshRooms(prev => prev + 1);
  };

  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden relative">
        <div className="z-30">
          <ViewRooms 
            onOpenCreateRoomModal={handleOpenCreateRoomModal}
            refreshTrigger={refreshRooms}
          />
        </div>
        <div className="flex-1 flex flex-col w-full absolute inset-0 pt-16">
          <div className="flex-1 overflow-scroll">
            <ChatBox />
          </div>
          <div className="p-2 sm:p-4 shadow-lg bg-white">
            <InputText />
          </div>
        </div>
      </div>
      
      <CreateRoomModal
        isOpen={isCreateRoomModalOpen}
        onClose={handleCloseCreateRoomModal}
        onRoomCreated={handleRoomCreated}
      />
    </div>
  );
}
