import { FormEvent, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom'

import logoImg from '../assets/images/logo.svg';

import { Button } from '../components/Button';
import { RoomCode } from '../components/RoomCode';
import { useAuth } from '../hooks/useAuth';
import { database } from '../services/firebase';

import '../styles/rooms.scss'

type FirebaseQuestions = Record<string, {
  author: {
    name: string,
    avatar: string
  },
  content: string;
  isAnswered: boolean,
  isHighlighted: boolean
}>

type Question = {
  id: string,
  author: {
    name: string,
    avatar: string
  },
  content: string;
  isAnswered: boolean,
  isHighlighted: boolean
}

type RoomParams = {
  id: string
}

export function Room() {

  const { user } = useAuth()

  //Pegar o valor do parametro ID da URL
  const params = useParams<RoomParams>()
  
  const [newQuestion, setNewQuestion] = useState('')
  const [questions ,setQuestions] = useState<Question[]>([])
  const [title, setTitle] = useState()

  const roomId = params.id;

  //Função que será disparada sempre que o Id da sala mudar
  useEffect(() => {
    console.log(roomId)

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
        }
      })

      //Alimentar o State com o titulo da pergunta
      setTitle(databaseRoom.title)

      //Alimentar o state questions com o array gerado (parsedQuestions)
      setQuestions(parsedQuestions)
    })
  },[roomId])


  async function handleSendQuestion(event: FormEvent) {
    event.preventDefault()

    if (newQuestion.trim() === '') {
      return
    }

    if(!user) {
      throw new Error('You must be logged in');
    }

    //Montagem dos dados que serão salvos na chave questions dentro da chave rooms
    const question = {
      content: newQuestion,
      author: {
        name: user.name,
        avatar: user.avatar
      },
      isHighlighted: false,
      isAnswered: false
    }

    //Gravar a pergunta dentro da chave que questions que está dentro de rooms
    await database.ref(`rooms/${roomId}/questions`).push(question)

    //Limpar o valor do state, fazendo assim com que o campo também seja limpo
    setNewQuestion('')
  }

  return(
    <div id="page-room">
      <header>
        <div className="content">
          <img src={logoImg} alt="Letmeask" />
          <RoomCode code={roomId} />
        </div>
      </header>

      <main>
        <div className="room-title">
          <h1>Sala {title}</h1>
          { questions.length > 0 && <span>{questions.length} pergunta(s)</span>}
        </div>

        <form onSubmit={handleSendQuestion}>
          <textarea 
            placeholder="O que você quer perguntar?" 
            onChange={event => setNewQuestion(event.target.value)}
            value={newQuestion}
          />

          <div className="form-footer">
            { user ? (
              <div className="user-info">
                <img src={user.avatar} alt={user.name} />
                <span>{user.name}</span>
              </div>
            ) : (
              <span>Para enviar uma pergunta, <button>faça seu login</button>.</span>
            )}
            <Button type="submit" disabled={!user}>Enviar pergunta</Button>
          </div>
        </form>

        {JSON.stringify(questions)}
      </main>
    </div>
  )
}