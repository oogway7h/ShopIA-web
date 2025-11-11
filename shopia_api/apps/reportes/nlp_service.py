import spacy
from spacy.matcher import Matcher
from spacy.pipeline import EntityRuler
import traceback
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta
import re


nlp = None
matcher = None

def _extraer_precios(texto: str) -> dict:
    params = {}
    
    match_rango = re.search(r"(?:entre|de)\s+(\d+)\s*(?:y|a)\s*(\d+)", texto, re.IGNORECASE)
    if match_rango:
        params["precio__gte"] = int(match_rango.group(1)) 
        params["precio__lte"] = int(match_rango.group(2)) 
        return params

    match_max = re.search(r"(?:menos de|hasta)\s+(\d+)", texto, re.IGNORECASE)
    if match_max:
        params["precio__lte"] = int(match_max.group(1))
        return params

    match_min = re.search(r"(?:más de|desde)\s+(\d+)", texto, re.IGNORECASE)
    if match_min:
        params["precio__gte"] = int(match_min.group(1))
        return params
    
    match_simple_max = re.search(r"(\d+)", texto, re.IGNORECASE)
    if match_simple_max:
        params["precio__lte"] = int(match_simple_max.group(1))
        return params
        
    return params



def _cargar_categorias_dinamicas(nlp_pipe):
    
    print("Cargando categorías desde la BD...")
    try:
        from apps.productos.models import Categoria
        
        categorias = Categoria.objects.all()
        if not categorias.exists():
            print("No se encontraron categorías en la BD.")
            return []

        nuevos_patrones = []
        for cat in categorias:
            pattern = {"label": "CATEGORIA", "pattern": cat.nombre.lower(), "id": str(cat.id)}
            nuevos_patrones.append(pattern)
        
        ruler = nlp_pipe.get_pipe("entity_ruler")
        ruler.add_patterns(nuevos_patrones)
        print(f" {len(nuevos_patrones)} categorías añadidas al NLP.")
        
    except Exception as e:
        print(f"ERROR al cargar categorías: {e}")
        traceback.print_exc()



def _convertir_entidad_fecha(entidad_texto: str) -> dict:
    
    hoy = datetime.now().date()
    fecha_inicio = None
    fecha_fin = hoy

    MESES = {
        "ENERO": 1, "FEBRERO": 2, "MARZO": 3, "ABRIL": 4, "MAYO": 5, "JUNIO": 6,
        "JULIO": 7, "AGOSTO": 8, "SEPTIEMBRE": 9, "OCTUBRE": 10, "NOVIEMBRE": 11, "DICIEMBRE": 12
    }

    try:
        if entidad_texto == "HOY":
            fecha_inicio = hoy
        elif entidad_texto == "AYER":
            fecha_inicio = hoy - timedelta(days=1)
            fecha_fin = fecha_inicio
        elif entidad_texto == "ULTIMA_SEMANA":
            fecha_inicio = hoy - timedelta(days=7)
        elif entidad_texto == "ULTIMO_MES":
            fecha_inicio = hoy - relativedelta(months=1)
        elif entidad_texto in MESES:
            mes_num = MESES[entidad_texto]
            año_actual = hoy.year
            fecha_inicio = datetime(año_actual, mes_num, 1).date()
            fecha_fin = (fecha_inicio + relativedelta(months=1)) - timedelta(days=1)
        
        if fecha_inicio:
            return {
                "fecha_inicio": fecha_inicio.isoformat(),
                "fecha_fin": fecha_fin.isoformat()
            }
    except Exception as e:
        print(f"No se pudo convertir la fecha para '{entidad_texto}': {e}")
    
    return {}


try:
    print("cargar 'es_core_news_sm'...")
    nlp = spacy.load("es_core_news_sm")
    print("Modelo cargado.")

except IOError:
    print("Método 1 falló. Intentando Método 2 ...")
    try:
        #si no funciona el metodo 1 importar directamente el paqueton
        import es_core_news_sm
        nlp = es_core_news_sm.load()
        print("Modelo cargado (Método 2).")
    except Exception:
        #solo depuracion
        print("ERROR CRÍTICO: No se pudo cargar el modelo spaCy.")
        print("Asegúrate de haber ejecutado en tu .venv:")
        print("1. pip install spacy python-dateutil")
        print("2. python -m spacy download es_core_news_sm")
        print("3. Reinicia este servidor de Django.")
        traceback.print_exc()
        nlp = None

#definicion de patrones
if nlp:
    #definicion de fechas
    ruler = nlp.add_pipe("entity_ruler", before="ner")
    patterns = [
        #para reportes
        {"label": "FECHA_RELATIVA", "pattern": "hoy", "id": "HOY"},
        {"label": "FECHA_RELATIVA", "pattern": "ayer", "id": "AYER"},
        {"label": "FECHA_RELATIVA", "pattern": [{"LOWER": "última"}, {"LOWER": "semana"}], "id": "ULTIMA_SEMANA"},
        {"label": "FECHA_RELATIVA", "pattern": [{"LOWER": "último"}, {"LOWER": "mes"}], "id": "ULTIMO_MES"},
        {"label":"FECHA_RELATIVA","pattern":[{"LOWER":"enero"}],"id":"ENERO"},
        {"label":"FECHA_RELATIVA","pattern":[{"LOWER":"febrero"}],"id":"FEBRERO"},
        {"label":"FECHA_RELATIVA","pattern":[{"LOWER":"marzo"}],"id":"MARZO"},
        {"label":"FECHA_RELATIVA","pattern":[{"LOWER":"abril"}],"id":"ABRIL"},
        {"label":"FECHA_RELATIVA","pattern":[{"LOWER":"mayo"}],"id":"MAYO"},
        {"label":"FECHA_RELATIVA","pattern":[{"LOWER":"junio"}],"id":"JUNIO"},
        {"label":"FECHA_RELATIVA","pattern":[{"LOWER":"agosto"}],"id":"AGOSTO"},
        {"label":"FECHA_RELATIVA","pattern":[{"LOWER":"septiembre"}],"id":"SEPTIEMBRE"},
        {"label":"FECHA_RELATIVA","pattern":[{"LOWER":"octubre"}],"id":"OCTUBRE"},
        {"label":"FECHA_RELATIVA","pattern":[{"LOWER":"noviembre"}],"id":"NOVIEMBRE"},
        {"label":"FECHA_RELATIVA","pattern":[{"LOWER":"diciembre"}],"id":"DICIEMBRE"},

    
        #para productos
        {"label": "PRECIO", "pattern": [{"LOWER": {"IN": ["entre", "de"]}}, {"IS_DIGIT": True}, {"LOWER": {"IN": ["y", "a"]}}, {"IS_DIGIT": True}]},
        {"label": "PRECIO", "pattern": [{"LOWER": "menos"}, {"LOWER": "de"}, {"IS_DIGIT": True}]},
        {"label": "PRECIO", "pattern": [{"LOWER": "hasta"}, {"IS_DIGIT": True}]},
        {"label": "PRECIO", "pattern": [{"LOWER": "más"}, {"LOWER": "de"}, {"IS_DIGIT": True}]},
        {"label": "PRECIO", "pattern": [{"LOWER": "desde"}, {"IS_DIGIT": True}]},
        {"label": "PRECIO", "pattern": [{"LOWER": "de"}, {"IS_DIGIT": True}]}, #de 5000
        {"label": "PRECIO", "pattern": [{"LOWER": "precio"}, {"LOWER": "de"}, {"IS_DIGIT": True}]}, # precio de 5000
        {"label": "PRECIO", "pattern": [{"IS_DIGIT": True}]},#5000
    
    ]
    ruler.add_patterns(patterns)
    
    #definir lo que se quiere
    matcher = Matcher(nlp.vocab)
    _cargar_categorias_dinamicas(nlp)
    #para reportes
    #todos llevan a la desarga de un pdf o navegacion al dashboard
    pattern_pdf_ventas = [{"LOWER": {"IN": ["reporte", "listado", "descargar"]}}, {"LOWER": "de", "OP": "?"}, {"LOWER": "ventas"}]
    pattern_pdf_clientes = [{"LOWER": {"IN": ["reporte", "listado", "descargar"]}}, {"LOWER": "de", "OP": "?"}, {"LOWER": "clientes"}]

    pattern_dash_clientes = [{"LOWER": "dashboard"}, {"LOWER": "de", "OP": "?"}, {"LOWER": "clientes"}]
    pattern_dash_ventas = [{"LOWER": "dashboard"}, {"LOWER": "de", "OP": "?"}, {"LOWER": "ventas"}]
    
    matcher.add("REPORTE_PDF_VENTAS", [pattern_pdf_ventas])
    matcher.add("REPORTE_PDF_CLIENTES", [pattern_pdf_clientes])
    matcher.add("REPORTE_DASH_CLIENTES", [pattern_dash_clientes])
    matcher.add("REPORTE_DASH_VENTAS", [pattern_dash_ventas])
    
    #para productos
    pattern_ver_categoria = [{"LOWER": {"IN": ["mostrar", "ver", "muéstrame"]}}, {"LEMMA": "categoría", "OP": "?"}, {"ENT_TYPE": "CATEGORIA"}]
    pattern_buscar_precio = [{"LOWER": {"IN": ["buscar", "ver", "mostrar"]}}, {"LOWER": {"IN": ["productos", "cosas"]}}, {"ENT_TYPE": "PRECIO"}]
    pattern_buscar_texto = [{"LOWER": {"IN": ["buscar", "encontrar"]}}, {"IS_ASCII": True, "OP": "+"}] # Captura el resto de la frase

    matcher.add("BUSCAR_CATEGORIA", [pattern_ver_categoria])
    matcher.add("BUSCAR_PRECIO", [pattern_buscar_precio])
    matcher.add("BUSCAR_TEXTO", [pattern_buscar_texto])

    #por fechas
    pattern_mas_vendido = [{"LOWER": "producto"}, {"LOWER": "más"}, {"LOWER": "vendido"}]
    pattern_mas_vendidos = [{"LOWER": "productos"}, {"LOWER": "más"}, {"LOWER": "vendidos"}]
    pattern_top_productos = [{"LOWER": "top"}, {"LOWER": "productos"}]
    matcher.add("REPORTE_MAS_VENDIDO", [pattern_mas_vendido, pattern_mas_vendidos, pattern_top_productos])
    

    print("[NLP Service] Patrones de voz e intenciones cargados.")
else:
    print("[NLP Service] ADVERTENCIA: NLP deshabilitado (modelo no cargado).")



def procesar_comando_voz(texto: str) -> dict:
    if not nlp or not matcher:
        return {"error": "Servicio NLP no inicializado."}
        
    doc = nlp(texto.lower()) 
    params = {}
    entidades_encontradas = {} 

    fechas_encontradas=[]
    precios_encontrados=[]
    for ent in doc.ents:
        if ent.label_ == "FECHA_RELATIVA" and 'fecha' not in entidades_encontradas:
            entidad_id = ent.ent_id_
            print(f"Entidad fecha encontrada: {ent.text} (ID: {entidad_id})")
            params.update(_convertir_entidad_fecha(entidad_id))
            fechas_encontradas.append(entidad_id) 
            
        if ent.label_ == "CATEGORIA" and 'categoria' not in entidades_encontradas:
            entidad_id = ent.ent_id_
            print(f"[Entidad categiria encontrada: {ent.text} (ID: {entidad_id})")
            params['categoria'] = entidad_id
            entidades_encontradas['categoria'] = True
            
        if ent.label_ == "PRECIO" and 'precio' not in entidades_encontradas:
            print(f"Entidad precio encontrada: {ent.text}")
            params.update(_extraer_precios(ent.text))
            precios_encontrados.append(ent.text)
    #procesar fechas 
    if len(fechas_encontradas) > 0:
        entidades_encontradas['fecha'] = True
        
        if len(fechas_encontradas) >= 2:
            mes_inicio_id = fechas_encontradas[0]
            mes_fin_id = fechas_encontradas[-1]
            
            rango_inicio = _convertir_entidad_fecha(mes_inicio_id)
            rango_fin = _convertir_entidad_fecha(mes_fin_id)
            
            if "fecha_inicio" in rango_inicio and "fecha_fin" in rango_fin:
                params["fecha_inicio"] = rango_inicio["fecha_inicio"]
                params["fecha_fin"] = rango_fin["fecha_fin"]
                print(f"Rango de fechas detectado: {params['fecha_inicio']} a {params['fecha_fin']}")
            else:
                params.update(_convertir_entidad_fecha(fechas_encontradas[0]))
        
        elif len(fechas_encontradas) == 1:
            params.update(_convertir_entidad_fecha(fechas_encontradas[0]))
    
    
    #procesar precios
    if len(precios_encontrados) > 0:
        entidades_encontradas['precio'] = True
        params.update(_extraer_precios(precios_encontrados[0]))


    #bucar intenciones
    matches = matcher(doc)
    intent_string = None
    
    if matches:
        matches.sort(key=lambda x: x[2] - x[1], reverse=True)
        match_id, start, end = matches[0]
        intent_string = nlp.vocab.strings[match_id]
        print(f"Intención encontrada: {intent_string}")
        
    #hacer accion en base a todos los patrones encontrados
    #reportes 
    if intent_string and intent_string.startswith("REPORTE_"):
        if intent_string == "REPORTE_PDF_CLIENTES":
            return {"accion": "descargar", 
                    "reporte_id": "clientes", 
                    "url": "/api/reportes/clientes/pdf/", 
                    "fileName": "listado_clientes.pdf", 
                    "params": params}
        
        elif intent_string == "REPORTE_PDF_VENTAS":
            return {"accion": "descargar", 
                    "reporte_id": "ventas", 
                    "url": "/api/reportes/ventas/pdf/", 
                    "fileName": "listado_ventas.pdf", 
                    "params": params}
        
        elif intent_string == "REPORTE_DASH_CLIENTES":
            return {"accion": "navegar", 
                    "reporte_id": "clientes", 
                    "url": "/dashboard/reportes/dash/clientes", 
                    "params": params}
        
        elif intent_string == "REPORTE_DASH_VENTAS":
            return {"accion": "navegar", 
                    "reporte_id": "ventas", 
                    "url": "/dashboard/reportes/dash/ventas", 
                    "params": params}
        
        
        if intent_string == "REPORTE_MAS_VENDIDO":
            return {
                "accion": "descargar", 
                "reporte_id": "mas_vendidos",
                "url": "/api/reportes/mas_vendidos/pdf/", 
                "fileName": "reporte_mas_vendidos.pdf", 
                "params": params 
            }
        

    
    #busqueda en la tienda por categorias, o precios
    if 'categoria' in params or 'precio__gte' in params or 'precio__lte' in params:
        
        if intent_string == "BUSCAR_TEXTO":
             print("habla bien rwey.")
        
        if 'categoria' in params and 'precio__gte' not in params and 'precio__lte' not in params:
             print("Navegar a página de Categoría.")
             return {
                "accion": "navegar",
                "url": f"/categoria/{params['categoria']}", 
                "params": {} 
             }
        
        # Si hay precios con categoria o sin categoria se navega al catalogo/buscar
        return {
            "accion": "navegar",
            "url": "/catalogo/buscar", 
            "params": params 
        }

    #busqueda por texto libre
    if intent_string == "BUSCAR_TEXTO":
        texto_busqueda = doc[start + 1 : end].text.strip()
        if texto_busqueda and "precio" not in texto_busqueda and " de " not in texto_busqueda:
            params["search"] = texto_busqueda 
            return {
                "accion": "navegar",
                "url": "/catalogo/buscar",
                "params": params 
            }
            
    #si no entendio nada
    return {"error": "Comando no reconocido. Intente 'reporte de ventas' o 'mostrar teclados'."}