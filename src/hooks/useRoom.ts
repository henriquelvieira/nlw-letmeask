import { useEffect, useState } from "react"
import { database } from "../services/firebase"
import { useAuth } from "./useAuth"

type FirebaseQuestions = Record<string, {
  author: {
    name: string,
    avatar: string
  },
  content: string;
  isAnswered: boolean,
  isHighlighted: boolean;
  likes: Record<string, {
    authorId: string;
  }>
}>

type QuestionType = {
  id: string,
  author: {
    name: string,
    avatar: string
  },
  content: string;
  isAnswered: boolean,
  isHighlighted: boolean,
  likeCount: number,
  likeId: string | undefined,
}

//Receberá o ID da sala como parametro
export function useRoom(roomId: string) {

  const { user } = useAuth()
  const [questions, setQuestions] = useState<QuestionType[]>([])
  const [title, setTitle] = useState()

  //Função que será disparada sempre que o Id da sala ou do usuário mudar
  useEffect(() => {

    //Buscar os dados do Firebase da chave rooms para o Id informado
    const roomRef = database.ref(`rooms/${roomId}`)
    
    //Atraves do "on" a aplicação ficará "ouvindo" a base de dados, toda vez que os dados da chave em questão forem alterados esse código será executado novamente
    roomRef.on('value', room => {
      const databaseRoom = room.val()
      const firebaseQuestions: FirebaseQuestions = databaseRoom.questions ?? {};

      //Conversão do retorno do Firebase de object para um Array
      const parsedQuestions = Object.entries(firebaseQuestions).map( ([key, value]) => {
        return {
          id: key,
          content: value.content,
          author: value.author,
          isHighlighted: value.isHighlighted,
          isAnswered: value.isAnswered,
          likeCount: Object.values(value.likes ?? {}).length,
          likeId: Object.entries(value.likes ?? {}).find(([key, like]) =>  like.authorId === user?.id)?.[0]
        }
      })

      //Alimentar o State com o titulo da pergunta
      setTitle(databaseRoom.title)

      //Alimentar o state questions com o array gerado (parsedQuestions)
      setQuestions(parsedQuestions)
    })

    return () => {
      roomRef.off('value')
    }
    
  },[roomId, user?.id])

  return { questions, title }
}