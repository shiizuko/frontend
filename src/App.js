import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import QRCode from "react-qr-code";
import "./App.css"

export default function App() {
  const [step, setStep] = useState(1); // Controla o passo atual
  const [sessionId, setSessionId] = useState(null); // Armazena o ID da sessão
  const [isButtonDisabled, setIsButtonDisabled] = useState(false); 
  const [buttonText, setButtonText] = useState('Próximo');
  const [isFullScreen, setIsFullScreen] = useState(false);

  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [causeOfDeath, setCauseOfDeath] = useState(''); 

  const supabaseUrl = 'https://pvohcqzdzmzvzidyvjss.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2b2hjcXpkem16dnppZHl2anNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjcxMTUyNTAsImV4cCI6MjA0MjY5MTI1MH0.sopZMZLs8Kl8miYsS9rKhQ7sn38eRHQDIKfu2ltl1Yg';
  const supabase = createClient(supabaseUrl, supabaseKey);

  const handleStart = async () => {
    try {
      const { data, error, count } = await supabase
        .from('sessions')
        .insert([{ created_at: new Date().toISOString() }], { returning: 'representation' })
        .select('id')
        .single(); 
  
      console.log("Data:", data);
      console.log("Error:", error);
      console.log("Count:", count);
  
      if (error) {
        console.error('Erro ao criar sessão:', error.message);
        alert('Ocorreu um erro ao iniciar a sessão.');
        return;
      }
  
      if (!data || !data.id) {
        console.error('Nenhum dado retornado da criação de sessão ou `id` não encontrado');
        alert('Ocorreu um erro inesperado ao iniciar a sessão.');
        return;
      }
  
      setSessionId(data.id); // Armazena o ID da sessão
      setStep(2); // Vai para o passo 2 (QR Code)
    } catch (err) {
      console.error('Erro inesperado:', err.message);
      alert('Ocorreu um erro inesperado.');
    }
  };
  

  const handleNext = () => {

    setStep(3); // Vai para o passo 3 (Formulário)
  };

 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsButtonDisabled(true); 
    setButtonText('Processando...');
    if (!age || !name || !causeOfDeath) {
      alert('Por favor, forneça seu nome, idade e causa da morte.');
      return;
    }
  
    const data = {
      name,
      age,
      causeOfDeath,
    };
  
    try {
      // Primeiro, faz o upload da imagem e obtém a URL combinada da imagem
      const res = await fetch('http://18.226.165.47:5000/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
  
      const result = await res.json();
  
      if (result.message) {
        const imageUrl = result.combined_image_url; // Obtém a URL da imagem combinada
  
        // Em seguida, atualiza a linha correspondente no Supabase com a URL da imagem, idade e causa da morte
        const { error } = await supabase
          .from('sessions')
          .update({ image_url: imageUrl, age: age, cause_of_death: causeOfDeath })
          .eq('id', sessionId);
  
        if (error) {
          console.error('Erro ao atualizar sessão:', error.message);
          alert('Ocorreu um erro ao atualizar a sessão.');
          return;
        }
        
        setStep(4); // Vai para o passo 4 (Obrigado)
      } else {
        alert(`Erro: ${result.error}`);  
      }
    } catch (err) {
      console.error('Erro inesperado:', err.message);
      alert('Ocorreu um erro inesperado.');
    }
  };
  
  const handleFinish = () => {
    setStep(1); // Volta para o passo 1 (Tela inicial)
    setSessionId(null); // Reseta o ID da sessão
    setName('');
    setAge('');
    setCauseOfDeath('');
    setIsButtonDisabled(false); 
    setButtonText('Próximo');
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        alert(`Erro ao ativar o modo tela cheia: ${err.message}`);
      });
      setIsFullScreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullScreen(false);
      }
    }
  };
  
  
  return (
    <div className='h-screen w-screen bg-center bg-contain bg-no-repeat flex items-center justify-center bg-[#14120F] overlay-hidden' style={{ backgroundImage: "url('/background.png')" }}>
      <img src="/logofanta.png" height={150} width={150} className='fixed top-0 mt-5 contain animate pop delay-1' alt='logo fanta'/>
      <button 
        onClick={toggleFullScreen} 
        className={`fixed bottom-0 left-0 text-lg uppercase ${isFullScreen ? 'text-white/20 animate fade delay-1' : 'text-white animate-pulse '}`}
      >
        Tela <br/>Cheia
      </button>


      {step === 1 && (
        <div className='text-white hover:text-[#71B876] items-center text-center'>
          <button onClick={handleStart} className='text-8xl uppercase mr-7 animate glow delay-2'>Iniciar</button>
          <img src="/deco.png" height={200} width={800} className='object-contain animate fade delay-3' alt=''/>
        </div>
      )}
      
      {step === 2 && (
        <div className='text-white text-center flex flex-col justify-center'>
          {sessionId && (
            <div style={{ background: 'white', padding: '16px' }} className='items-center mx-auto mt-32 animate pop delay-1'>
              <QRCode
            size={256}
            style={{ height: "150px", maxWidth: "150px", width: "150px" }}
            value={`${window.location.href}session/${sessionId}`} 
            viewBox={`0 0 256 256`}
          />
          </div>
          )}
          <button onClick={handleNext} className='mt-8 text-6xl hover:text-[#71B876] animate glow delay-2'>Próximo</button>
          <img src="/deco.png" height={200} width={800} className='object-contain animate fade delay-3' alt=''/>
        </div>
      )}
      
      {step === 3 && (
        <div className='text-white text-center'>
          <form onSubmit={handleSubmit} className='space-y-2 min-w-full mt-[5.8rem] text-center items-center'>
            <div className='animate fade delay-1'>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className='text-white text-center text-2xl p-2 bg-[#14120F] outline-0 '
              />
             <img src="/deco.png" height={50} width={600} className='object-contain' alt=''/>
             <label className="text-xl uppercase block">Nome Completo</label>
            </div>
            <div className='animate fade delay-2'>
            <input
              type="number"
              value={age}
              onChange={(e) => {
                if (e.target.value.length <= 2) {
                  setAge(e.target.value);
                }
              }}
              maxLength="2"
              required
              className='text-white text-center text-2xl p-2 bg-[#14120F] outline-0'
            />

              <img src="/deco.png" height={50} width={600} className='object-contain' alt=''/>
              <label className='text-xl uppercase block'>Idade</label>
            </div>
            <div className='animate fade delay-3'>
              <select
                value={causeOfDeath}
                onChange={(e) => setCauseOfDeath(e.target.value)}
                required
                className='text-white text-center text-2xl p-3 bg-[#14120F] outline-0'
              >
                <option value=""></option>
                <option value="1">Morreu de vingança de ex</option>
                <option value="2">Morreu de vergonha alheia</option>
                <option value="3">Morreu de rir das próprias piadas</option>
                <option value="4">Morreu de esperar retornarem a mensagem</option>
                <option value="5">Assustou-se com a própria sombra</option>
              </select>
              <img src="/deco.png" height={50} width={600} className='object-contain' alt=''/>
              <label className='text-xl uppercase block mb-2'>Causa da Morte</label>
            </div>
            <button type="submit" className=' text-2xl hover:text-[#71B876] animate fade delay-5'  disabled={isButtonDisabled}>{buttonText}</button>
            <img src="/deco.png" height={50} width={400} className='object-contain mx-auto items-center animate fade delay-6' alt=''/>
            
          </form>
        </div>
      )}
      
      {step === 4 && (
        <div className='text-white text-center'>
          <h1 className='text-7xl mb-5 animate pop delay-1'>Obrigado por participar!</h1>
          <button onClick={handleFinish} className='text-5xl hover:text-[#71B876] mt-32 animate fade delay-2'>Finalizar</button>
          <img src="/deco.png" height={200} width={800} className='object-contain animate fade delay-3' alt=''/>

        </div>
      )}
    </div>
  );
}
