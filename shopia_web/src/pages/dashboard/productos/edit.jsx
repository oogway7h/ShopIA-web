import { useState, useEffect } from "react";
import { api } from "../../../services/apiClient.js";
import { useNavigate, useParams } from "react-router-dom";
import ProductoForm from "../../../components/dashboard/ProductosForm.jsx"; 

function Spinner() {
  return (
    <div className="flex justify-center items-center p-10 bg-white rounded-2xl shadow-xl">
      <svg className="animate-spin h-8 w-8 text-gray-600" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <span className="ml-4 text-lg text-gray-700">Cargando datos del producto...</span>
    </div>
  );
}

export default function ProductoEditPage() {
  const [categorias, setCategorias] = useState([]);
  const [producto, setProducto] = useState(null); 
  const [pageLoading, setPageLoading] = useState(true); 
  const [formLoading, setFormLoading] = useState(false); 
  const [error, setError] = useState("");
  const navigate = useNavigate(); 
  const { id } = useParams(); 

  
  useEffect(() => {
    if (!id) {
      setError("No se ha proporcionado un ID de producto.");
      return;
    }

    setError("");
    setPageLoading(true);

    const fetchProducto = api.get(`/api/productos/${id}/`);
    const fetchCategorias = api.get("/api/categorias/");

    Promise.all([fetchProducto, fetchCategorias])
      .then(([productoData, categoriasData]) => {
        setProducto(productoData); 
        setCategorias(Array.isArray(categoriasData) ? categoriasData : []);
      })
      .catch(e => {
        setError("Error al cargar los datos. " + (e.response?.data?.detail || e.message));
        console.error(e);
      })
      .finally(() => {
        setPageLoading(false);
      });
  }, [id]); 
  
  function handleSubmit(data) {
    setFormLoading(true);
    setError(""); 
    
    const descuentoNumerico = parseFloat(data.descuento) || 0;
    const descuentoParaAPI = descuentoNumerico / 100.0;
    
    const payload = {
      nombre: data.nombre,
      marca: data.marca,
      descripcion: data.descripcion,
      precio: data.precio,       
      stock: data.stock,        
      url_imagen_principal: data.url_imagen_principal || null,
      categoria_id: data.categoria, 
      descuento: descuentoParaAPI,
      imagenes: data.imagenes || [],
    };

    console.log("Actualizando en backend:", payload);

    
    api.put(`/api/productos/${id}/`, payload)
      .then(() => {
        navigate("/dashboard/productos"); 
      })
      .catch(e => {
        setError("Error al actualizar el producto. " + (e.response?.data?.detail || e.message));
        console.error(e);
      })
      .finally(() => {
        setFormLoading(false);
      });
  }

  function handleCancel() {
    navigate("/dashboard/productos");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-cyan-100">
        <div className="container mx-auto py-8 px-4">
            <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-xl mb-8 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-6 text-white">
                    <h1 className="text-3xl md:text-4xl font-bold">Editar Producto</h1>
                    <p className="text-purple-100 text-lg">Modifica los campos del producto</p>
                </div>
            </div>
            {error && (
                <div className="mb-4 px-4 py-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm shadow-sm">
                    <p className="font-bold">Ha ocurrido un error</p>
                    <p>{error}</p>
                </div>
            )}
            
            
            {pageLoading ? (
              <Spinner />
            ) : (
              <ProductoForm
                  initialProducto={producto} 
                  categorias={categorias}
                  onSubmit={handleSubmit}
                  onCancel={handleCancel}
                  loading={formLoading} 
                  submitText="Guardar Cambios" 
              />
            )}
        </div>
    </div>
  );
}