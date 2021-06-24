import { useHistory } from 'react-router-dom';

import illustrationImg from '../assets/images/illustration.svg'
import logoImg from '../assets/images/logo.svg'
import googleIconImg from '../assets/images/google-icon.svg'

import { database } from '../services/firebase';

import { Button } from '../components/Button';
import { useAuth } from '../hooks/useAuth';
import { FormEvent, useState } from 'react';
import '../styles/auth.scss';

export function Home() {
  const history = useHistory()
  const { user, signInWithGoogle } = useAuth()
  const [roomCode, setRoomCode] = useState('')

  async function handleCreateRoom() {
    //Testa se o state user está preenchido (logado), caso não chama o metodo de autenticação do Google
    if(!user) {
      await signInWithGoogle()
    }
 
    //Redireciona o usuário para a tela de criação das salas caso o mesmo esteja autenticado
    history.push('/rooms/new')
  }


  async function handleJoinRoom(event: FormEvent) {
    event.preventDefault()

    //testa se o campo foi preenchido
    if(roomCode.trim() === '') {
      return
    }

    //Consulta se existe algum registro dentro da chave Rooms com o ID que foi passado pelo usuário
    const roomRef = await database.ref(`rooms/${roomCode}`).get()

    //Testa se a sala existe
    if(!roomRef.exists()) {
      alert('Room does not exists.');
      return
    }

    //Validar se a sala ainda está aberta
    if(roomRef.val().endedAt) {
      alert('Room already closed.')
      return
    }

    //Redireciona o usuário para a sala que foi criada
    history.push(`/rooms/${roomCode}`);
  }

  return (
    <div id="page-auth">
      <aside>
        <img src={illustrationImg} alt="Ilustração simbolizando perguntas e respostas" />
        <strong>Crie salas de Q&amp;A ao-vivo</strong>
        <p>
          Tire as dúvidas da sua audiência em tempo-real
        </p>
      </aside>

      <main>
        <div className="main-content">
          <img src={logoImg} alt="Letmeask" />
          <button onClick={handleCreateRoom} className="create-room">
            <img src={googleIconImg} alt="Logo do Google" />
            Crie sua sala com o Google
          </button>

          <div className="separator">ou entre em uma sala</div>

          <form onSubmit={handleJoinRoom}>
            <input 
              type="text" 
              placeholder="Digite o código da sala"
              onChange={event => setRoomCode(event.target.value)}
              value={roomCode}
            />
            <Button type="submit">
              Entrar na sala
            </Button>
          </form>

        </div>
      </main>
    </div>
  )
}