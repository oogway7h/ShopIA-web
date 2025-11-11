import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import { ArrowLeft, AlertCircle, FileText, Loader2 } from "lucide-react";
import axios from "axios";
const API_BASE = import.meta.env.VITE_API_BASE;
import VoiceCommandButton from "./reconocimieto_voz"; 



export default function PaginaReportesClientes() {
  const [loadingReport, setLoadingReport] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handlePersonalizarReporte(reporteId) {
    navigate(`/dashboard/reportes/dash/${reporteId}`); 
  }

  
  async function handleDescargarReporte(reportId, reportUrlPath, fileName) {
    setLoadingReport(reportId);
    setError("");

    try {
      const token = localStorage.getItem("token"); 
      const url = `${API_BASE}${reportUrlPath}`;

      const response = await axios.get(url, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "", 
        },
        responseType: "blob",
      });

      const fileType = response.headers['content-type'] || 'application/octet-stream';
      const file = new Blob([response.data], { type: fileType });
      const fileURL = URL.createObjectURL(file);

      const link = document.createElement("a");
      link.href = fileURL;
      link.setAttribute("download", fileName); 
      document.body.appendChild(link);
      link.click();

      link.parentNode.removeChild(link);
      URL.revokeObjectURL(fileURL);

    } catch (e) {
      console.error(`Error al descargar ${fileName}:`, e);
      let errorMsg = e.message;
      if (e.response && e.response.data && e.response.data.toString() === '[object Blob]') {
        try {
          const errorBlobText = await e.response.data.text();
          errorMsg = errorBlobText;
        } catch {
          errorMsg = "Error indescifrable al descargar el archivo."
        }
      } else if (e.response && e.response.data) {
        errorMsg = e.response.data.detail || e.response.data;
      }
      
      setError(`No se pudo generar el reporte (${fileName}): ${errorMsg}`);
    } finally {
      setLoadingReport(null);
    }
  }

  const reportesDeTienda = [
    
    {
      id: 'clientes-json',
      titulo: 'Dashboard de Clientes',
      descripcion: 'Ver un dashboard interactivo de los nuevos clientes por mes.',
      personalizado: true,
      personalizadoUrlId: 'clientes' 
    },
    {
      id: 'clientes-pdf',
      titulo: 'Listado de Clientes (PDF)',
      urlPath: '/api/reportes/clientes/pdf/', 
      fileName: 'listado_clientes.pdf',
      descripcion: 'Descarga un listado de todos los clientes registrados.',
      personalizado: false
    },
    {
      id: 'clientes-excel',
      titulo: 'Listado de Clientes (Excel)',
      urlPath: '/api/reportes/clientes/excel/', 
      fileName: 'listado_clientes_detallado.xlsx',
      descripcion: 'Descarga los datos completos de clientes en formato Excel.',
      personalizado: false
    },
  ];


  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate(-1)} // Vuelve atrás
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors font-medium"
            >
              <ArrowLeft size={20} />
              <span className="hidden sm:inline">Volver</span>
            </button>
            <div className="h-6 w-px bg-gray-300"></div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Reportes de Tienda</h1>
              <p className="text-gray-600 mt-1">
                Generación de reportes de clientes.
              </p>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
            <div>
              <h3 className="text-red-800 font-semibold">
                Error al generar reporte
              </h3>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
        )}

        
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-white border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">
              Reportes de Clientes
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              Descarga reportes en PDF/Excel o visualiza los dashboards.
            </p>
          </div>

          <div className="p-6">
            <div className="flex flex-col gap-4">
              {/* Bucle sobre la nueva lista de reportes */}
              {reportesDeTienda.map((report) => (
                <div
                  key={report.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border border-gray-200 rounded-lg bg-gray-50"
                >
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800">{report.titulo}</h4>
                    <p className="text-sm text-gray-500 mt-1">{report.descripcion}</p>
                  </div>
                  
                  {/* Botón condicional */}
                  {report.personalizado ? (
                    // Botón para "Ver Dashboard"
                    <button
                      onClick={() => handlePersonalizarReporte(report.personalizadoUrlId)}
                      disabled={loadingReport !== null}
                      className="mt-3 sm:mt-0 sm:ml-4 flex-shrink-0 w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md transition-colors font-semibold"
                    >
                      <FileText size={20} />
                      <span>Ver Dashboard</span>
                    </button>
                  ) : (
                    // Botón para descargar
                    <button
                      onClick={() => handleDescargarReporte(report.id, report.urlPath, report.fileName)}
                      disabled={loadingReport !== null}
                      className="mt-3 sm:mt-0 sm:ml-4 flex-shrink-0 w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-md transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loadingReport === report.id ? (
                        <Loader2 size={20} className="animate-spin" />
                      ) : (
                        <FileText size={20} />
                      )}
                      <span>
                        {loadingReport === report.id ? "Generando..." : (report.fileName.includes('.xlsx') ? "Descargar Excel" : "Descargar PDF")}
                      </span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
            
          {/* Sección de Comando de voz */}
          <div className="p-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Comando de Voz</h3>
            <p className="text-sm text-gray-500 mb-4">
              Presiona el botón y di un comando, como "ver dashboard de clientes".
            </p>
            <VoiceCommandButton/>
          </div>

        </div>
      </div>
    </div>
  );
}