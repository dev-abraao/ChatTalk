import { Dispatch, SetStateAction } from "react";
import { fetchUsername, getUserId } from "@/(actions)/user";
import { saveMessage } from "@/(actions)/message";

export default async function HandleMessage(
  e: React.FormEvent,
  message: string,
  setMessage: Dispatch<SetStateAction<string>>,
  send: (message: { text: string; metadata: { username: string } }) => void,
  roomId: string
) {
  e.preventDefault();

  if (message.trim() === "") return;

  const username = await fetchUsername();
  const userId = await getUserId();
  
  //console.log("Username:", username);

  if (!username || !userId) {
    console.error("Username ou userId não encontrados");
    return;
  }

  send({
    text: message,
    metadata: { username }
  });
  
  try {
    await saveMessage({
      content: message,
      roomId,
      userId: userId as string,
    });
    console.log("Mensagem salva no banco de dados");
  } catch (error) {
    console.error("Erro ao salvar mensagem no banco:", error);
  }
  
  setMessage("");
}