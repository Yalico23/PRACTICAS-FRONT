// compartiPantalla.tsx
import React, { useRef, useState } from 'react';

const CompartirPantalla: React.FC = () => {
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunks = useRef<Blob[]>([]);

  const startScreenRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });

      recordedChunks.current = [];

      const recorder = new MediaRecorder(stream, { mimeType: 'video/webm; codecs=vp9' });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunks.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunks.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);

        // ✅ Forzar descarga del archivo
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `grabacion-pantalla-${new Date().toISOString()}.webm`;
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(url);

        console.log('[INFO] Grabación completada y descargada automáticamente.');
      };

      recorder.start();
      setRecording(true);

      // Detener si se deja de compartir pantalla
      stream.getVideoTracks()[0].addEventListener('ended', () => {
        stopRecording();
      });

      console.log('[INFO] Grabando pantalla...');
    } catch (error) {
      console.error('[ERROR] Al intentar compartir pantalla:', error);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  return (
    <div className='container mx-auto p-4'>
      <h2 className='text-center'>Compartir y Grabar Pantalla</h2>
      <button
        className='bg-purple-400 text-white p-2 rounded-lg hover:bg-purple-600 transition'
        onClick={recording ? stopRecording : startScreenRecording}
      >
        {recording ? 'Detener Grabación' : 'Iniciar Compartir Pantalla'}
      </button>
    </div>
  );
};

export default CompartirPantalla;
