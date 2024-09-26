import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { motion } from 'framer-motion'; // Importa o framer-motion

const supabaseUrl = 'https://pvohcqzdzmzvzidyvjss.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2b2hjcXpkem16dnppZHl2anNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjcxMTUyNTAsImV4cCI6MjA0MjY5MTI1MH0.sopZMZLs8Kl8miYsS9rKhQ7sn38eRHQDIKfu2ltl1Yg';
const supabase = createClient(supabaseUrl, supabaseKey);

const ImagePage = () => {
  const { sessionId } = useParams(); 
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) {
      console.error("sessionId não encontrado na URL");
      return;
    }

    const fetchImageUrl = async () => {
      console.log("Iniciando fetch para sessionId:", sessionId); 

      const { data, error } = await supabase
        .from('sessions')
        .select('image_url')
        .eq('id', sessionId)
        .single();

      if (error) {
        console.error('Erro ao buscar imagem:', error);
        setLoading(false);
        return;
      }

      if (data && data.image_url) {
        setImageUrl(data.image_url);
        console.log("imageUrl obtido:", data.image_url); 
      } else {
        console.log("Nenhuma image_url encontrada para este sessionId:", sessionId);
      }

      setLoading(false);
    };

    fetchImageUrl();
  }, [sessionId]);

  if (loading) {
    return (
      <div className='h-screen w-screen flex flex-col items-center justify-center bg-[#14120F] text-5xl text-white text-center'>
        Carregando...
      </div>
    );
  }

  if (!imageUrl) {
    return (
      <div className='h-screen w-screen flex flex-col items-center justify-center bg-[#14120F] text-5xl text-white text-center'>
        Imagem sendo processada.<br /> 
        Seu certificado de morte será gerado em breve.
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#14120F] p-12">
      <motion.img 
        src={imageUrl} 
        alt="Imagem da sessão" 
        className="w-[30rem] h-auto mb-5 object-contain mt-12" 
        initial={{ opacity: 0, filter: 'blur(10px)' }} 
        animate={{ opacity: 1, filter: 'blur(0px)' }}
        transition={{ duration: 2 }} 
      />
      <a href={imageUrl} download className="text-white hover:text-[#71B876] text-2xl">
        Baixar Imagem
      </a>
    </div>
  );
};

export default ImagePage;
