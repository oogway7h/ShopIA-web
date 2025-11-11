from django.urls import path
from . import views
urlpatterns = [
    #esta api es /api/reportes/lo que sea/pdf/
    path('ventas/pdf/', 
         views.generar_reporte_ventas_pdf, 
         name='reporte_ventas_pdf'),

     path('ventas/excel/',
         views.generar_reporte_ventas_excel,
         name='reporte_ventas_dia'),

    path('clientes/pdf/',
         views.generar_reporte_clientes_pdf,
         name='reporte_clientes_pdf'),

    path('clientes/excel/',
         views.generar_reporte_clientes_excel,
         name='reporte_clientes_excel'),

    
    path('ventasjson/', 
         views.reporte_ventas_por_dia_json, 
         name='reporte_ventasjson'),

    path('clientesjson/',
         views.reporte_clientes_por_mes_json,
         name='reporte_ventasjson'),

     path('comando_voz/',
         views.procesar_comando_voz_json,
         name='procesar_comando_voz'),
     

     path('mas_vendidos/pdf/',
          views.generar_reporte_mas_vendidos_pdf,
          name='reporte_mas_vendidos_pdf'),
     
     path('mas_vendidos/excel/',
          views.generar_reporte_mas_vendidos_excel,
          name='reporte_mas_vendidos_excel'),

]