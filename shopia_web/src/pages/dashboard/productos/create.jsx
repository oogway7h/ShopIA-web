import { useState, useEffect } from "react";
import { api } from "../../../services/apiClient.js";
import { useNavigate } from "react-router-dom";
import ProductoForm from "../../../components/dashboard/ProductosForm.jsx"; 


export default function ProductoCreatePage() {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate(); 
  const [page, setPage] = useState('create'); 

  
  useEffect(() => {
    setError("");
    setLoading(true);
    
    api.get("/api/categorias/")
      .then((r) => {
        setCategorias(Array.isArray(r) ? r : []);
      })
      .catch(e => {
        setError("Error al cargar las categorías. " + e.message);
        console.error(e);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []); 

  
  function handleSubmit(data) {
    setLoading(true);
    setError(""); 
    
    //dividir el descuento entre 100 para que de el decimal y despues calcular el precio final de ventas
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

    console.log("Enviando al backend:", payload);

    api.post("/api/productos/", payload)
      .then(() => {
        navigate("/dashboard/productos"); //llevar a la pagina de prductos cuando se agrege
        
      })
      .catch(e => {
        setError("Error al crear el producto. " + (e.response?.data?.detail || e.message));
        console.error(e);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  function handleCancel() {
    navigate("/dashboard/productos");//llevar a la pagina de productos si cancela la accion
    
  }

  
  if (page === 'success') {
    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="bg-white p-10 rounded-lg shadow-lg text-center">
                <h2 className="text-2xl font-bold text-green-600 mb-4">¡Producto Creado!</h2>
                <p>El producto ha sido creado exitosamente.</p>
                <button onClick={() => { setPage('create'); navigate('/dashboard/productos'); }} className="mt-6 mr-2 px-5 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition">Volver a la Lista</button>
                <button onClick={() => setPage('create')} className="mt-6 px-5 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">Crear otro producto</button>
            </div>
        </div>
    );
  }
  


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-cyan-100">
        <div className="container mx-auto py-8 px-4">
            <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-xl mb-8 overflow-hidden">
                <div className="bg-gradient-to-r from-green-600 to-cyan-600 px-8 py-6 text-white">
                    <h1 className="text-3xl md:text-4xl font-bold">Crear Nuevo Producto</h1>
                    <p className="text-green-100 text-lg">Completa el formulario para añadir un nuevo producto al catálogo</p>
                </div>
            </div>
            {error && (
                <div className="mb-4 px-4 py-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm shadow-sm">
                    <p className="font-bold">Ha ocurrido un error</p>
                    <p>{error}</p>
                </div>
            )}
            <ProductoForm
                categorias={categorias}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                loading={loading}
                submitText="Crear Producto" 
            />
        </div>
    </div>
  );
}