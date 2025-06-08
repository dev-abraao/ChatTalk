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
    setRefreshRooms((prev) => prev + 1);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <div className="hidden lg:block">
          <ViewRooms
            onOpenCreateRoomModal={handleOpenCreateRoomModal}
            refreshTrigger={refreshRooms}
          />
        </div>

        <div className="lg:hidden">
          <ViewRooms
            onOpenCreateRoomModal={handleOpenCreateRoomModal}
            refreshTrigger={refreshRooms}
          />
        </div>

        <div className="flex-1 flex justify-center lg:ml-0">
          <div className="w-full max-w-8xl lg:px-6 flex flex-col">
            <div className="flex-1 bg-white lg:rounded-lg lg:shadow-sm lg:border lg:border-gray-200 lg:my-4 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-scroll">
                <ChatBox />
              </div>
              <div className="p-4 border-t border-gray-100 bg-white lg:rounded-b-lg">
                <InputText />
              </div>
            </div>
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
