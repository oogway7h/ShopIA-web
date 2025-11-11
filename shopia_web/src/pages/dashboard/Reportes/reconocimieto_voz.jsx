import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MicVocal, Mic, Loader2, AlertCircle, Send } from 'lucide-react';
import { api } from '../../../services/apiClient';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE;

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition;

if (SpeechRecognition) {
  recognition = new SpeechRecognition();
  recognition.lang = 'es-ES';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
}

export default function VoiceCommandButton({ variant = 'default' }) {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [tuEstadoDeTexto, setTuEstadoDeTexto] = useState("");
  const navigate = useNavigate();

  //constructor de los parametros
  const buildUrlWithParams = (urlPath, params) => {
    let url = `${API_BASE_URL}${urlPath}`;
    if (params && Object.keys(params).length > 0) {
      const queryParams = new URLSearchParams(params).toString();
      url += `?${queryParams}`;
    }
    return url;
  };

  const handleGenerarReportePorPrompt = async (prompt) => {
    try {
      const nlpResponse = await api.post('/api/reportes/comando_voz/', {
        texto_comando: prompt,
      });
      const accion = nlpResponse;
      if (accion && accion.accion === 'descargar') {
        await descargarPdfPorVoz(accion.url, accion.fileName, accion.params);
      }
    }
    catch (e) {
      setError('Error al generar el reporte por prompt: ' + e.message);
    }
  };

  //descarga por voz
  const descargarPdfPorVoz = async (urlPath, fileName, params) => {
    setFeedback(`Generando ${fileName}...`);
    try {
      const token = localStorage.getItem("token");
      const url = buildUrlWithParams(urlPath, params);
      const response = await axios.get(url, {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
        responseType: "blob",
      });
      const file = new Blob([response.data], { type: "application/pdf" });
      const fileURL = URL.createObjectURL(file);
      const link = document.createElement("a");
      link.href = fileURL;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(fileURL);
      setFeedback(`Reporte de ${fileName} descargado.`);
    } catch (e) {
      setError("Error al descargar el archivo solicitado.");
      setFeedback("");
    }
  };

  //navegar por voz pero con parametros
  const navegarPorVoz = (urlPath, params) => {
    let url = urlPath;
    if (params && Object.keys(params).length > 0) {
      const queryParams = new URLSearchParams(params).toString();
      url += `?${queryParams}`;
    }
    navigate(url);
  };

  const handleVoiceCommand = () => {
    if (!SpeechRecognition) {
      setError("Tu navegador no soporta el reconocimiento de voz.");
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
      setFeedback("");
      return;
    }

    setIsListening(true);
    setError("");
    setFeedback("Escuchando... ");

    try {
      recognition.start();
    } catch (e) {
      setError("No se pudo iniciar el micrófono. ¿Ya está en uso?");
      setIsListening(false);
      setFeedback("");
      return;
    }

    recognition.onstart = () => {
      // Reconocimiento iniciado
    };

    recognition.onspeechstart = () => {
      setFeedback("Capturando tu voz...");
    };

    recognition.onspeechend = () => {
      setFeedback("Procesando...");
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onresult = async (event) => {
      const textoComando = event.results[0][0].transcript;
      setFeedback(`Comando reconocido: "${textoComando}". Procesando...`);

      try {
        const nlpResponse = await api.post('/api/reportes/comando_voz/', {
          texto_comando: textoComando,
        });

        const accion = nlpResponse;

        if (accion && accion.accion === 'descargar') {
          await descargarPdfPorVoz(accion.url, accion.fileName, accion.params);
        } else if (accion && accion.accion === 'navegar') {
          setFeedback(`Navegando a ${accion.reporte_id}...`);
          navegarPorVoz(accion.url, accion.params);
        } else {
          if (accion && accion.error) {
            setError(accion.error);
            setFeedback("");
          } else {
            setError("No se reconoció una acción válida.");
            setFeedback("");
          }
        }

      } catch (e) {
        if (e.message && (e.message.includes("Comando no reconocido") || e.message.includes("Servicio NLP"))) {
          setError(e.message);
        } else {
          setError("No se pudo procesar el comando. Revisa la consola.");
        }
        setFeedback("");
      }
    };

    recognition.onerror = (event) => {
      switch (event.error) {
        case "no-speech":
          setFeedback("No se detectó voz. Intenta de nuevo.");
          break;
        case "network":
          setError("Error de red: el servicio de voz no está disponible.");
          break;
        case "not-allowed":
        case "security":
          setError("Permiso de micrófono denegado. Actívalo en el navegador.");
          break;
        case "aborted":
          setFeedback("");
          break;
        default:
          setError(`Error de voz: ${event.error}`);
      }
      setIsListening(false);
    };
  };

  if (!SpeechRecognition) {
    return (
      <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <AlertCircle className="text-yellow-600" size={20} />
        <span className="text-yellow-800 text-sm">
          El reconocimiento de voz no es compatible con este navegador.
        </span>
      </div>
    );
  }

  if (variant === 'fab') {
    return (
      <div className="w-16 h-16 relative">
        <button
          onClick={handleVoiceCommand}
          className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300
            ${isListening
              ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-300 scale-110'
              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-300'
            }`}
          aria-label={isListening ? "Detener reconocimiento" : "Iniciar comando de voz"}
        >
          {isListening ? (
            <Loader2 size={24} className="animate-spin" />
          ) : (
            <MicVocal size={24} />
          )}
        </button>
        <div className="absolute bottom-full mb-2 w-72 left-1/2 -translate-x-1/2">
          {feedback && !error && (
            <p className="text-sm text-gray-700 bg-white p-3 rounded-lg shadow-lg text-center"></p>
          )}
          {error && (
            <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg shadow-lg text-center font-medium">{error}</p>
          )}
        </div>
      </div>
    );
  }

  //Estilo default para la pagina de reportes
  return (
    <div className="w-full">
      <button
        onClick={handleVoiceCommand}
        className={`w-full flex items-center justify-center gap-3 px-6 py-3 rounded-lg transition-colors font-semibold shadow-lg
          ${isListening
            ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-300'
            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-300'
          }`}
      >
        {isListening ? (
          <Loader2 size={22} className="animate-spin" />
        ) : (
          <Mic size={22} />
        )}
        <span>{isListening ? 'Detener' : 'Comando de Voz'}</span>
      </button>

      <div className="p-6 border-t border-gray-200">
        <label
          htmlFor="prompt-texto"
          className="block text-lg font-semibold text-gray-800 mb-3"
        >
          O ingresa un prompt escrito
        </label>

        <textarea
          id="prompt-texto"
          name="prompt"
          rows="3"
          className="w-full p-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          placeholder="Ejemplo: 'Generar reporte de ventas de ayer' ..."
          value={tuEstadoDeTexto}
          onChange={(e) => setTuEstadoDeTexto(e.target.value)}
        />

        <button
          onClick={() => handleGenerarReportePorPrompt(tuEstadoDeTexto)}
          className="mt-3 w-full flex items-center justify-center gap-2 px-5 py-2.5 text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md transition-colors font-semibold disabled:opacity-50"
        >
          <Send size={18} />
          <span>Generar reporte</span>
        </button>
      </div>

      <div className="h-4 mt-2 text-center">
        {feedback && !error && (
          <p className="text-sm text-gray-600">{feedback}</p>
        )}
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
      </div>
    </div>
  );
}

