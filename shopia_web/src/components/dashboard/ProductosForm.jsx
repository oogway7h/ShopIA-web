import { useState, useEffect } from "react";

// --- Componente Field (sin cambios) ---
function Field({ label, required, error, description, children }) {
  // ... (este componente es idéntico al tuyo)
  return (
    <div className="space-y-2">
      <label className="block text-sm font-bold text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}{" "}
      </label>
        {" "}
      {description && (
        <p className="text-xs text-gray-500 -mt-1">{description}</p>
      )}
      {children}{" "}
      {error && <p className="text-sm text-red-600">{error}</p>}{" "}
    </div>
  );
}

const MARCAS_CHOICES = [
  "Samsung",
  "LG",
  "Sony",
  "Electrolux",
  "Consul",
  "Bosch",
  "Whirpool",
  "Panasonic",
  "Lenovo",
  "Asus",
  "Razer",
  "Logitech",
  "Apple",
  "Xiaomi",
  "Otra",
];

export default function ProductoForm({
  initialProducto = null,
  categorias = [],
  onSubmit,
  onCancel,
  loading = false,
  submitText = "Crear Producto",
}) {
  const editMode = !!initialProducto;
  const [form, setForm] = useState({
    nombre: "",
    marca: "",
    descripcion: "",
    precio: "",
    stock: "",
    categoria: "",
    url_imagen_principal: "",
    descuento: "",
    imagenes: [],
  });
  const [touched, setTouched] = useState({});
  const [uploading, setUploading] = useState(false);
  const [imageError, setImageError] = useState("");

  useEffect(() => {
    if (initialProducto) {
      setForm({
        nombre: initialProducto.nombre || "",
        marca: initialProducto.marca || "",
        descripcion: initialProducto.descripcion || "",
        precio: initialProducto.precio || "",
        stock: initialProducto.stock || "",
        categoria:
          initialProducto.categoria?.id || initialProducto.categoria || "",
        url_imagen_principal: initialProducto.url_imagen_principal || "",
        descuento:
          initialProducto.descuento !== undefined && initialProducto.descuento !== null
            ? parseFloat(initialProducto.descuento) * 100
            : "",
        imagenes: initialProducto.imagenes || [],
      });
    } else {
      setForm({
        nombre: "",
        marca: "",
        descripcion: "",
        precio: "",
        stock: "",
        categoria: "",
        url_imagen_principal: "",
        descuento: "",
        imagenes: [],
      });
    }
  }, [initialProducto]);

  function setField(name, value) {
    setForm((f) => ({ ...f, [name]: value }));
  }
  
  async function handleImageChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    setImageError("");
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "ml_default");
    formData.append("folder", "imgProductos");

    try {
      const res = await fetch(
        "https://api.cloudinary.com/v1_1/dlhfdfu6l/image/upload",
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await res.json();
      
      if (data.secure_url && data.public_id) {
        const nuevaImagen = {
          url: data.secure_url,
          public_id: data.public_id,
          descripcion: file.name
        };
        
        setField("imagenes", [...form.imagenes, nuevaImagen]);
        // Limpiar el input
        e.target.value = '';
      } else {
        setImageError("Error al subir la imagen.");
      }
    } catch {
      setImageError("Error al subir la imagen.");
    } finally {
      setUploading(false);
    }
  }

  async function handleDeleteImage(index) {
    const imagen = form.imagenes[index];
    
    // Si la imagen tiene public_id, eliminarla de Cloudinary
    if (imagen.public_id) {
      try {
        const formData = new FormData();
        formData.append("public_id", imagen.public_id);
        formData.append("api_key", "114436485182671");
        formData.append("timestamp", Math.round(new Date().getTime() / 1000));
        
        await fetch(
          `https://api.cloudinary.com/v1_1/dlhfdfu6l/image/destroy`,
          {
            method: "POST",
            body: formData,
          }
        );
      } catch (error) {
        console.error("Error al eliminar imagen de Cloudinary:", error);
      }
    }
    
    // Eliminar del formulario
    const nuevasImagenes = form.imagenes.filter((_, i) => i !== index);
    setField("imagenes", nuevasImagenes);
  }

  function handleSubmit(e) {
    e.preventDefault();
    setTouched({
      nombre: true,
      marca: true,
      descripcion: true,
      precio: true,
      stock: true,
      categoria: true,
    });

    const invalidChecks = {
      nombre: !form.nombre,
      marca: !form.marca,
      descripcion: !form.descripcion,
      precio: isNaN(parseFloat(form.precio)) || parseFloat(form.precio) <= 0,
      stock:
        form.stock === "" ||
        isNaN(parseInt(form.stock, 10)) ||
        parseInt(form.stock, 10) < 0,
      categoria: !form.categoria,
    };

    if (Object.values(invalidChecks).some(Boolean)) {
      return;
    }

    const payload = {
      ...form,
      precio: parseFloat(form.precio),
      stock: parseInt(form.stock, 10),
      descuento:
        form.descuento === "" || isNaN(parseFloat(form.descuento))
          ? 0
          : parseFloat(form.descuento),
    };

    console.log("Payload del formulario:", payload);
    console.log("Imágenes en el payload:", payload.imagenes);

    onSubmit(payload);
  }

  const invalid = {
    nombre: touched.nombre && !form.nombre,
    marca: touched.marca && !form.marca,
    descripcion: touched.descripcion && !form.descripcion,
    precio:
      touched.precio &&
      (isNaN(parseFloat(form.precio)) || parseFloat(form.precio) <= 0),
    stock:
      touched.stock &&
      (form.stock === "" ||
        isNaN(parseInt(form.stock, 10)) ||
        parseInt(form.stock, 10) < 0),
    categoria: touched.categoria && !form.categoria,
    descuento:
      touched.descuento &&
      (form.descuento === "" ||
        isNaN(parseFloat(form.descuento)) ||
        parseFloat(form.descuento) < 0 ||
        parseFloat(form.descuento) > 100),
  };

  const formId = "producto-form";

  return (
    <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-xl overflow-hidden">
      <div className="p-8 md:p-10">
        <form id={formId} onSubmit={handleSubmit} noValidate>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-10 gap-y-8">
            <div className="space-y-6">
              <div className="border-l-4 border-purple-500 pl-6 py-2">
                <h3 className="text-xl font-bold text-gray-800">
                  Información del Producto
                </h3>
                <p className="text-gray-600">
                  Datos principales y descripción.
                </p>
              </div>
              <Field
                label="Nombre del Producto"
                required
                error={invalid.nombre && "El nombre es obligatorio"}
              >
                <input
                  value={form.nombre}
                  onChange={(e) => setField("nombre", e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, nombre: true }))}
                  disabled={loading}
                  className={`w-full p-2 border rounded ${
                    invalid.nombre ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Ej. Mouse Razer Viper Mini"
                />
              </Field>

              <Field
                label="Marca del Producto"
                required
                error={invalid.marca && "La marca es obligatoria"}
              >
                <select
                  value={form.marca}
                  onChange={(e) => setField("marca", e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, marca: true }))}
                  disabled={loading}
                  className={`w-full p-2 border rounded ${
                    invalid.marca ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="" disabled>
                    Seleccione una marca
                  </option>
                  {MARCAS_CHOICES.map((marca) => (
                    <option key={marca} value={marca}>
                      {marca}
                    </option>
                  ))}
                </select>
              </Field>

              <Field
                label="Descripción"
                required
                error={invalid.descripcion && "La descripción es obligatoria"}
              >
                <textarea
                  value={form.descripcion}
                  onChange={(e) => setField("descripcion", e.target.value)}
                  onBlur={() =>
                    setTouched((t) => ({ ...t, descripcion: true }))
                  }
                  disabled={loading}
                  rows={4}
                  className={`w-full p-2 border rounded ${
                    invalid.descripcion ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Describe el producto..."
                />
              </Field>
              <Field
                label="Categoría"
                required
                error={invalid.categoria && "Debes seleccionar una categoría"}
              >
                <select
                  value={form.categoria}
                  onChange={(e) => setField("categoria", e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, categoria: true }))}
                  disabled={loading || categorias.length === 0}
                  className={`w-full p-2 border rounded ${
                    invalid.categoria ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="" disabled>
                    Seleccione una categoría{" "}
                  </option>
                  {categorias.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nombre}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <div className="space-y-6">
              <div className="border-l-4 border-cyan-500 pl-6 py-2">
                <h3 className="text-xl font-bold text-gray-800">
                  Detalles y Stock
                </h3>
                <p className="text-gray-600">Precio, inventario e imagen.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field
                  label="Precio"
                  required
                  error={
                    invalid.precio && "El precio debe ser un número positivo"
                  }
                >
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={form.precio}
                    onChange={(e) => setField("precio", e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, precio: true }))}
                    disabled={loading}
                    className={`w-full p-2 border rounded ${
                      invalid.precio ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Ej: 19.99"
                  />
                </Field>
                <Field
                  label="Stock"
                  required
                  error={invalid.stock && "El stock debe ser 0 o mayor"}
                >
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={form.stock}
                    onChange={(e) => setField("stock", e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, stock: true }))}
                    disabled={loading}
                    className={`w-full p-2 border rounded ${
                      invalid.stock ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Ej: 50"
                  />
                </Field>
              </div>

              <Field
                label="Descuento (%)"
                // required // Quitar el required
                description="Ingrese un número de 0 a 100. (Ej: 10 para 10%)"
                // error={invalid.descuento && "Debe ser un número entre 0 y 100"} // Quitar validación obligatoria
              >
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={form.descuento}
                  onChange={(e) => setField("descuento", e.target.value)}
                  // onBlur={() => setTouched((t) => ({ ...t, descuento: true }))}
                  disabled={loading}
                  className="w-full p-2 border rounded border-gray-300"
                  placeholder="Ej: 10"
                />
              </Field>

              {/* Nueva sección para imágenes adicionales */}
              <Field
                label="Imágenes Adicionales"
                description="Sube imágenes adicionales del producto desde tu dispositivo."
                error={imageError}
              >
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      disabled={loading || uploading}
                      className="hidden"
                      id="imagen-upload"
                    />
                    <label
                      htmlFor="imagen-upload"
                      className={`flex items-center gap-2 px-4 py-2 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                        uploading || loading
                          ? "border-gray-300 bg-gray-100 cursor-not-allowed"
                          : "border-gray-300 hover:border-blue-400 hover:bg-blue-50"
                      }`}
                    >
                      {uploading ? (
                        <>
                          <svg className="animate-spin h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span className="text-sm text-blue-600">Subiendo...</span>
                        </>
                      ) : (
                        <>
                          <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          <span className="text-sm text-gray-600">Agregar imagen</span>
                        </>
                      )}
                    </label>
                  </div>

                  {/* Lista de imágenes */}
                  {form.imagenes.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {form.imagenes.map((imagen, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={imagen.url}
                            alt={imagen.descripcion || `Imagen ${index + 1}`}
                            className="w-full h-20 object-cover rounded-lg border"
                          />
                          <button
                            type="button"
                            onClick={() => handleDeleteImage(index)}
                            disabled={loading}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                          >
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Field>
            </div>
          </div>
        </form>
      </div>
      <div className="bg-gray-50 px-8 md:px-10 py-6 border-t-2 border-gray-200 flex justify-end gap-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-8 py-3 text-gray-700 bg-white border-2 border-gray-300 rounded-xl font-semibold hover:bg-gray-100 transition-all shadow-md"
        >
          Cancelar
        </button>
        <button
          type="submit"
          form={formId}
          disabled={loading}
          className="px-8 py-3 bg-gradient-to-r from-green-600 to-cyan-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-cyan-700 transition-all shadow-lg flex items-center gap-2"
        >
          {loading && (
            <svg
              className="animate-spin h-5 w-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          )}
          {loading ? "Guardando..." : submitText}
        </button>
      </div>
    </div>
  );
}
