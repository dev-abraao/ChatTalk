"use client";

import { useEffect, useState } from "react";
import { getRoomsByCategory, deleteRoom } from "@/(actions)/room";
import { CategorizedRooms } from "@/(lib)/definitions";
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
        className="fixed z-40 top-[1rem] left-2 bg-[#7A80DA] text-white p-2 rounded-full shadow-lg"
        aria-label={
          isVisible ? "Fechar painel de salas" : "Abrir painel de salas"
        }
      >
        {isVisible ? <MdClose size={20} /> : <MdMenu size={20} />}
      </button>

      <div
        className={`bg-[#F4F4F4] rounded w-64 border-r border-gray-200 fixed left-0 top-[4.2rem] sm:top-[4.2rem] bottom-0 flex flex-col z-10 transition-transform duration-300 ${
          isVisible ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center border-b border-gray-200">
          <h1 className="text-xl font-bold p-4">Salas</h1>
          <div className="flex items-center gap-2 mr-4">
            <CurrentRoomIndicator />
            <button
              onClick={fetchRooms}
              disabled={loading}
              className="p-2 rounded-full hover:bg-gray-200 transition-colors"
              title="Atualizar salas"
            >
              <MdRefresh className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
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
            Minhas salas
          </button>
          <button
            onClick={() => setActiveTab("joined")}
            className={`flex-1 py-2 px-3 text-sm font-medium ${
              activeTab === "joined"
                ? "border-b-2 border-[#7A80DA] text-[#7A80DA]"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >
            Salas que participo
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
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
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
                    <div className="bg-white p-3 rounded-lg shadow-sm hover:bg-gray-50 cursor-pointer transition">
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
          className="fixed inset-0 bg-black bg-opacity-30 z-0"
          onClick={() => setIsVisible(false)}
        />
      )}
    </>
  );
}
