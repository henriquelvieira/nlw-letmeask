import { useParams, useHistory } from 'react-router-dom'

import logoImg from '../assets/images/logo.svg';
import deleteImg from '../assets/images/delete.svg';

import { Button } from '../components/Button';
import { Question } from '../components/Question';
import { RoomCode } from '../components/RoomCode';
import { useRoom } from '../hooks/useRoom';

import '../styles/rooms.scss'
import { database } from '../services/firebase';

type RoomParams = {
  id: string
}

export function AdminRoom() {

  const history = useHistory()

  //Pegar o valor do parametro ID da URL
  const params = useParams<RoomParams>()
  const roomId = params.id;
  
    //Chamada do hook para retornar as questões da sala com base na passagem do ID
  const { title, questions } = useRoom(roomId)

  async function handleEndRoom() {
    //Encerrar a sala (Adicionar a data de encerramento da sala)
    await database.ref(`rooms/${roomId}`).update({
      endedAt: new Date(),
    })

    //Redicionar o usuário para a home
    history.push('/');
  }

  async function handleDeleteQuestion(questionId: string) {
    //Remover a pergunta
    if (window.confirm('Tem certeza que deseja excluir essa pergunta?')) {
      await database.ref(`rooms/${roomId}/questions/${questionId}`).remove()
    }
  }

  return(
    <div id="page-room">
      <header>
        <div className="content">
          <img src={logoImg} alt="Letmeask" />
          <div>
            <RoomCode code={roomId} />
            <Button isOutlined onClick={handleEndRoom}>Encerrar sala</Button>
          </div>
        </div>
      </header>

      <main>
        <div className="room-title">
          <h1>Sala {title}</h1>
          { questions.length > 0 && <span>{questions.length} pergunta(s)</span>}
        </div>

        <div className="question-list">
          {questions.map(question => {
            return <Question 
              key={question.id}
              content={question.content} 
              author={question.author} 
              >
                <button
                  type="button"
                  onClick={() => handleDeleteQuestion(question.id)}
                >
                  <img src={deleteImg} alt="Remover pergunta" />
                </button>
              </Question>
          })}
        </div>
      </main>
    </div>
  )
}