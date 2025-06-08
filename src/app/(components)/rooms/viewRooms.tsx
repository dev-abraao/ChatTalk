"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { getRoomsByCategory, deleteRoom } from "@/(actions)/room";
import type { CategorizedRooms } from "@/(lib)/definitions";
import CreateRoomForm from "./createRoomForm";
import { MdRefresh, MdMenu, MdClose, MdDelete } from "react-icons/md";
import Link from "next/link";
import { format } from "date-fns";
import { hasUserCreatedRoom } from "@/(actions)/user";
import CurrentRoomIndicator from "../chat/CurrentRoomIndicator";

type TabType = "created" | "joined" | "explore";

interface ViewRoomsProps {
  onOpenCreateRoomModal: () => void;
  refreshTrigger: number;
}

export default function ViewRooms({
  onOpenCreateRoomModal,
  refreshTrigger,
}: ViewRoomsProps) {
  const [categorizedRooms, setCategorizedRooms] = useState<CategorizedRooms>({
    createdRooms: [],
    joinedRooms: [],
    otherRooms: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("created");
  const [userCanCreateRoom, setUserCanCreateRoom] = useState(true);

  const fetchRooms = () => {
    setLoading(true);
    setError(null);
    getRoomsByCategory()
      .then((data: CategorizedRooms) => {
        setCategorizedRooms(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  };

  const fetchUserStatus = async () => {
    try {
      const hasCreated = await hasUserCreatedRoom();
      setUserCanCreateRoom(!hasCreated);
    } catch (error) {
      console.error("Erro ao verificar status do usuário:", error);
    }
  };

  useEffect(() => {
    fetchRooms();
    fetchUserStatus();
  }, []);

  useEffect(() => {
    if (refreshTrigger > 0) {
      fetchRooms();
      fetchUserStatus();
    }
  }, [refreshTrigger]);

  const handleDeleteRoom = async (e: React.MouseEvent, roomId: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (
      confirm(
        "Tem certeza que deseja excluir esta sala? Esta ação não pode ser desfeita."
      )
    ) {
      try {
        setLoading(true);
        await deleteRoom(roomId);
        fetchRooms();
        fetchUserStatus();
      } catch (error) {
        console.error("Erro ao excluir sala:", error);
        alert("Não foi possível excluir a sala.");
      } finally {
        setLoading(false);
      }
    }
  };

  const displayedRooms = () => {
    switch (activeTab) {
      case "created":
        return categorizedRooms.createdRooms;
      case "joined":
        return categorizedRooms.joinedRooms;
      case "explore":
        return categorizedRooms.otherRooms;
      default:
        return [];
    }
  };

  return (
    <>
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed z-40 top-[1rem] left-2 bg-[#7A80DA] text-white p-2 rounded-full shadow-lg lg:hidden"
        aria-label={
          isVisible ? "Fechar painel de salas" : "Abrir painel de salas"
        }
      >
        {isVisible ? <MdClose size={20} /> : <MdMenu size={20} />}
      </button>

      <div className="hidden lg:block w-80 bg-white border-r border-gray-200 h-full flex flex-col shadow-sm">
        <div className="flex justify-between items-center border-b border-gray-200 p-6">
          <h1 className="text-xl font-bold text-gray-800">Salas</h1>
          <div className="flex items-center gap-3">
            <CurrentRoomIndicator />
            <button
              onClick={fetchRooms}
              disabled={loading}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              title="Atualizar salas"
            >
              <MdRefresh
                className={`h-5 w-5 text-gray-600 ${
                  loading ? "animate-spin" : ""
                }`}
              />
            </button>
          </div>
        </div>

        <div className="flex border-b border-gray-200 bg-gray-50">
          <button
            onClick={() => setActiveTab("created")}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === "created"
                ? "border-b-2 border-[#7A80DA] text-[#7A80DA] bg-white"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >
            Minhas salas
          </button>
          <button
            onClick={() => setActiveTab("joined")}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === "joined"
                ? "border-b-2 border-[#7A80DA] text-[#7A80DA] bg-white"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >
            Participo
          </button>
          <button
            onClick={() => setActiveTab("explore")}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === "explore"
                ? "border-b-2 border-[#7A80DA] text-[#7A80DA] bg-white"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >
            Explorar
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7A80DA]"></div>
          </div>
        ) : error ? (
          <div className="p-6 text-red-500 text-center">
            Erro ao carregar as salas
          </div>
        ) : (
          <div className="p-4 overflow-y-auto flex-grow">
            {displayedRooms().length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl text-gray-400">💬</span>
                </div>
                <p className="text-gray-500 text-sm">
                  {activeTab === "created" &&
                    "Você ainda não criou nenhuma sala"}
                  {activeTab === "joined" &&
                    "Você ainda não entrou em nenhuma sala"}
                  {activeTab === "explore" &&
                    "Nenhuma sala disponível para explorar"}
                </p>
              </div>
            ) : (
              displayedRooms().map((room) => (
                <div key={room.id} className="relative mb-3">
                  <Link href={`/chat/${room.id}`}>
                    <div className="bg-gray-50 hover:bg-gray-100 p-4 rounded-lg cursor-pointer transition-all duration-200 border border-gray-100 hover:border-gray-200 hover:shadow-sm">
                      <h2 className="text-sm font-semibold truncate pr-8 text-gray-800 mb-1">
                        {room.name}
                      </h2>
                      <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                        {room.description || "Sem descrição"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(room.created_at), "dd/MM/yyyy")}
                      </p>
                    </div>
                  </Link>

                  {activeTab === "created" && (
                    <button
                      onClick={(e) => handleDeleteRoom(e, room.id)}
                      className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-red-500 hover:bg-white rounded-full transition-colors z-10 shadow-sm"
                      title="Excluir sala"
                    >
                      <MdDelete size={16} />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "created" && (
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            {userCanCreateRoom ? (
              <CreateRoomForm onOpenCreateRoomModal={onOpenCreateRoomModal} />
            ) : (
              <div className="text-center p-3 text-xs text-gray-600 bg-gray-100 rounded-lg border border-gray-200">
                Você já criou uma sala. Apenas uma sala por usuário é permitida.
              </div>
            )}
          </div>
        )}
      </div>

      <div
        className={`lg:hidden bg-white rounded w-80 border-r border-gray-200 fixed left-0 top-[4.2rem] bottom-0 flex flex-col z-50 transition-transform duration-300 shadow-lg ${
          isVisible ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center border-b border-gray-200 p-4">
          <h1 className="text-xl font-bold text-gray-800">Salas</h1>
          <div className="flex items-center gap-2">
            <CurrentRoomIndicator />
            <button
              onClick={fetchRooms}
              disabled={loading}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              title="Atualizar salas"
            >
              <MdRefresh
                className={`h-5 w-5 text-gray-600 ${
                  loading ? "animate-spin" : ""
                }`}
              />
            </button>
          </div>
        </div>

        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("created")}
            className={`flex-1 py-2 px-3 text-sm font-medium ${
              activeTab === "created"
                ? "border-b-2 border-[#7A80DA] text-[#7A80DA]"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >
            Minhas
          </button>
          <button
            onClick={() => setActiveTab("joined")}
            className={`flex-1 py-2 px-3 text-sm font-medium ${
              activeTab === "joined"
                ? "border-b-2 border-[#7A80DA] text-[#7A80DA]"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >
            Participo
          </button>
          <button
            onClick={() => setActiveTab("explore")}
            className={`flex-1 py-2 px-3 text-sm font-medium ${
              activeTab === "explore"
                ? "border-b-2 border-[#7A80DA] text-[#7A80DA]"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >
            Explorar
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7A80DA]"></div>
          </div>
        ) : error ? (
          <div className="p-4 text-red-500">Erro ao carregar as salas</div>
        ) : (
          <div className="p-2 overflow-y-auto flex-grow">
            {displayedRooms().length === 0 ? (
              <p className="text-gray-500 text-center p-4">
                {activeTab === "created" && "Você ainda não criou nenhuma sala"}
                {activeTab === "joined" &&
                  "Você ainda não entrou em nenhuma sala"}
                {activeTab === "explore" &&
                  "Nenhuma sala disponível para explorar"}
              </p>
            ) : (
              displayedRooms().map((room) => (
                <div key={room.id} className="relative mb-2">
                  <Link href={`/chat/${room.id}`}>
                    <div className="bg-white p-3 rounded-lg shadow-sm hover:bg-gray-50 cursor-pointer transition border border-gray-100">
                      <h2 className="text-md font-semibold truncate pr-7">
                        {room.name}
                      </h2>
                      <p className="text-sm text-gray-600">
                        {room.description || "Sem descrição"}
                      </p>
                      <p className="text-xs text-gray-500">
                        Criada em:{" "}
                        {format(
                          new Date(room.created_at),
                          "dd/MM/yyyy HH:mm:ss"
                        )}
                      </p>
                    </div>
                  </Link>

                  {activeTab === "created" && (
                    <button
                      onClick={(e) => handleDeleteRoom(e, room.id)}
                      className="absolute top-3 right-3 p-1.5 text-gray-500 hover:text-red-500 hover:bg-gray-100 rounded-full transition-colors z-10"
                      title="Excluir sala"
                    >
                      <MdDelete size={18} />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "created" && (
          <div className="p-2 mt-auto">
            {userCanCreateRoom ? (
              <CreateRoomForm onOpenCreateRoomModal={onOpenCreateRoomModal} />
            ) : (
              <div className="text-center p-2 text-sm text-gray-600 bg-gray-100 rounded-md">
                Você já criou uma sala. Apenas uma sala por usuário é permitida.
              </div>
            )}
          </div>
        )}
      </div>

      {isVisible && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-30 z-40"
          onClick={() => setIsVisible(false)}
        />
      )}
    </>
  );
}
