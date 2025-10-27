import React, { useState, useMemo } from "react";

export default function SmartTable({
  titulo = "Gestionar",
  data = [],
  columns = [],
  loading = false,
  emptyMessage = "Sin registros disponibles",
  onCreate,
  onEdit,
  onDelete,
  onView,
  actionsLabel = "Acciones",
  actionsRender,
  showDeletedButton = false,
  deletedActive = false,
  onToggleDeleted,
  className = "",
  compact = false,
  searchable = true,
  pagination = true, // Cambiar default a true
  itemsPerPage = 10,
  showStats = true,
  customHeaderActions,
  hideActions = false, // Nueva prop para ocultar columna acciones
}) {
  const [sortState, setSortState] = useState({ key: null, dir: null });
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const sortableColumns = useMemo(
    () => new Set(columns.filter(c => c.enableSort).map(c => c.key)),
    [columns]
  );

  // Filtrado por búsqueda
  const filteredData = useMemo(() => {
    if (!searchTerm || !searchable) return data;
    return data.filter(item => {
      return columns.some(col => {
        const value = item[col.key];
        return String(value || "").toLowerCase().includes(searchTerm.toLowerCase());
      });
    });
  }, [data, searchTerm, columns, searchable]);

  // Ordenamiento
  const sortedData = useMemo(() => {
    if (!sortState.key || !sortState.dir) return filteredData;
    const arr = [...filteredData];
    arr.sort((a, b) => {
      const va = a[sortState.key];
      const vb = b[sortState.key];
      if (va == null && vb == null) return 0;
      if (va == null) return 1;
      if (vb == null) return -1;
      if (typeof va === "number" && typeof vb === "number") {
        return sortState.dir === "asc" ? va - vb : vb - va;
      }
      const sa = String(va).toLowerCase();
      const sb = String(vb).toLowerCase();
      if (sa < sb) return sortState.dir === "asc" ? -1 : 1;
      if (sa > sb) return sortState.dir === "asc" ? 1 : -1;
      return 0;
    });
    return arr;
  }, [filteredData, sortState]);

  // Paginación
  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData;
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedData, currentPage, itemsPerPage, pagination]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  function toggleSort(col) {
    if (!sortableColumns.has(col.key)) return;
    setSortState(prev => {
      if (prev.key !== col.key) return { key: col.key, dir: "asc" };
      if (prev.dir === "asc") return { key: col.key, dir: "desc" };
      return { key: null, dir: null };
    });
  }

  const hideClass = (bp) => {
    switch (bp) {
      case "sm": return "hidden sm:table-cell";
      case "md": return "hidden md:table-cell";
      case "lg": return "hidden lg:table-cell";
      case "xl": return "hidden xl:table-cell";
      default: return "";
    }
  };

  return (
    <div className={`w-full bg-white rounded-2xl border-2 border-gray-100 shadow-lg  ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-white via-blue-50 to-white px-6 md:px-8 py-6 border-b-2 border-gray-200">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 flex items-center gap-2">
              <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-blue-700 rounded-full"></div>
              {titulo}
            </h2>
            {showStats && !loading && (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-1.5 rounded-lg">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span className="font-medium">{sortedData.length} registros</span>
                </div>
                {searchTerm && (
                  <div className="bg-blue-50 border border-blue-200 text-blue-700 px-3 py-1.5 rounded-lg">
                    <span className="font-medium">Filtrado: "{searchTerm}"</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            {/* Buscador */}
            {searchable && (
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar en la tabla..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-12 pr-4 py-3 text-sm bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300 transition-all hover:border-gray-300 w-full sm:w-72"
                />
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              {/* Acciones personalizadas del header */}
              {customHeaderActions}

              {/* Botón eliminados */}
              {showDeletedButton && (
                <button
                  onClick={onToggleDeleted}
                  className={`px-4 py-3 text-sm rounded-xl font-medium border-2 transition-all duration-200 ${
                    deletedActive
                      ? "bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100 shadow-md"
                      : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 shadow-sm"
                  }`}
                >
                  <span className="sm:inline flex items-center gap-2">
                    <span>{deletedActive ? "🔄" : "🗑️"}</span>
                    {deletedActive ? "Ver Activos" : "Ver Eliminados"}
                  </span>
                  <span className="sm:hidden text-lg">
                    {deletedActive ? "🔄" : "🗑️"}
                  </span>
                </button>
              )}

              {/* Botón crear */}
              {onCreate && (
                <button
                  onClick={onCreate}
                  className="px-5 py-3 text-sm rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold shadow-xl hover:shadow-2xl border-2 border-blue-600 hover:border-blue-700 transition-all duration-200 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="hidden sm:inline">Crear nuevo</span>
                  <span className="sm:hidden">Crear</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="border-l-2 border-r-2 border-gray-100">
        <div className="overflow-x-auto">
          <table className={`min-w-full ${compact ? "text-xs" : "text-sm"}`}>
            {/* Header de tabla */}
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
              <tr>
                {columns.map((col) => {
                  const active = sortState.key === col.key;
                  const canSort = sortableColumns.has(col.key);
                  return (
                    <th
                      key={col.key}
                      style={col.width ? { width: col.width, minWidth: col.minWidth } : { minWidth: col.minWidth }}
                      onClick={() => toggleSort(col)}
                      className={`px-4 md:px-6 py-4 text-left font-bold text-gray-700 text-xs uppercase tracking-wider select-none border-r border-gray-200 last:border-r-0 ${
                        col.headerClass || ""
                      } ${col.hideBelow ? hideClass(col.hideBelow) : ""} ${
                        canSort ? "cursor-pointer hover:bg-gray-200 transition-colors" : ""
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="truncate">{col.label}</span>
                        {canSort && (
                          <div className="flex flex-col text-[10px] text-gray-400">
                            {active ? (
                              sortState.dir === "asc" ? (
                                <span className="text-blue-600 font-bold">▲</span>
                              ) : (
                                <span className="text-blue-600 font-bold">▼</span>
                              )
                            ) : (
                              <span className="opacity-50">⇅</span>
                            )}
                          </div>
                        )}
                      </div>
                    </th>
                  );
                })}
                {/* Solo mostrar columna acciones si no está oculta */}
                {!hideActions && (
                  <th className="px-4 md:px-6 py-4 text-center font-bold text-gray-700 text-xs uppercase tracking-wider">
                    {actionsLabel}
                  </th>
                )}
              </tr>
            </thead>

            <tbody className="bg-white divide-y-2 divide-gray-100">
              {/* Estado de carga */}
              {loading && (
                <tr>
                  <td colSpan={columns.length + (hideActions ? 0 : 1)} className="px-6 py-20">
                    <div className="flex flex-col items-center gap-6">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-blue-500 animate-bounce"></div>
                        <div className="w-4 h-4 rounded-full bg-blue-500 animate-bounce delay-100"></div>
                        <div className="w-4 h-4 rounded-full bg-blue-500 animate-bounce delay-200"></div>
                      </div>
                      <p className="text-gray-600 font-semibold text-lg">Cargando datos...</p>
                      <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full animate-pulse"></div>
                      </div>
                    </div>
                  </td>
                </tr>
              )}

              {/* Estado vacío */}
              {!loading && sortedData.length === 0 && (
                <tr>
                  <td colSpan={columns.length + (hideActions ? 0 : 1)} className="px-6 py-20">
                    <div className="flex flex-col items-center gap-6">
                      <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center border-2 border-gray-200">
                        <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-600 font-semibold text-xl mb-2">{emptyMessage}</p>
                        <p className="text-gray-500">
                          {searchTerm ? "Intenta con otros términos de búsqueda" : "No hay datos para mostrar"}
                        </p>
                      </div>
                      {onCreate && !searchTerm && (
                        <button
                          onClick={onCreate}
                          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-semibold border-2 border-blue-600 shadow-lg hover:shadow-xl transition-all"
                        >
                          Crear el primero
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}

              {/* Filas de datos */}
              {!loading &&
                paginatedData.map((row, i) => (
                  <tr
                    key={row.id ?? i}
                    className="hover:bg-blue-50/30 transition-colors duration-200 border-l-4 border-transparent hover:border-l-blue-400"
                  >
                    {columns.map(col => {
                      const value = row[col.key];
                      return (
                        <td
                          key={col.key}
                          className={`px-4 md:px-6 py-4 whitespace-nowrap border-r border-gray-100 last:border-r-0 ${
                            col.cellClass || ""
                          } ${col.hideBelow ? hideClass(col.hideBelow) : ""}`}
                        >
                          <div className="max-w-xs truncate" title={typeof value === "string" ? value : undefined}>
                            {col.render ? col.render(row, value) : (value ?? "—")}
                          </div>
                        </td>
                      );
                    })}
                    {/* Solo mostrar celda acciones si no está oculta */}
                    {!hideActions && (
                      <td className="px-4 md:px-6 py-4 text-center whitespace-nowrap">
                        {actionsRender ? (
                          actionsRender(row)
                        ) : (
                          <div className="flex items-center justify-center gap-2">
                            {onView && (
                              <button
                                onClick={() => onView(row)}
                                className="p-2.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg border border-transparent hover:border-blue-200 transition-all shadow-sm hover:shadow-md"
                                title="Ver detalles"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </button>
                            )}
                            {onEdit && (
                              <button
                                onClick={() => onEdit(row)}
                                className="p-2.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg border border-transparent hover:border-emerald-200 transition-all shadow-sm hover:shadow-md"
                                title="Editar"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                            )}
                            {onDelete && (
                              <button
                                onClick={() => onDelete(row)}
                                className="p-2.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-200 transition-all shadow-sm hover:shadow-md"
                                title="Eliminar"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer con paginación */}
      {pagination && !loading && sortedData.length > itemsPerPage && (
        <div className="px-4 md:px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-t-2 border-gray-200">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-sm text-gray-600 font-medium">
              {!loading && (
                <>
                  Mostrando <span className="font-bold text-gray-800">{((currentPage - 1) * itemsPerPage) + 1}</span> a{" "}
                  <span className="font-bold text-gray-800">
                    {Math.min(currentPage * itemsPerPage, sortedData.length)}
                  </span> de{" "}
                  <span className="font-bold text-gray-800">{sortedData.length}</span> registros
                </>
              )}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2.5 rounded-lg bg-white border-2 border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <div className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border-2 border-gray-200 rounded-lg shadow-sm">
                  Página <span className="font-bold">{currentPage}</span> de <span className="font-bold">{totalPages}</span>
                </div>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2.5 rounded-lg bg-white border-2 border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
