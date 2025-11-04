import { useState } from "react";
import Header from "../components/ecommerce/header";
import CarritoSidebar from "../components/ecommerce/carrito";
import { Outlet } from "react-router-dom";

function MainLayout() {
  const [carritoAbierto, setCarritoAbierto] = useState(false);
  const [reloadCart, setReloadCart] = useState(0);

  return (
    <>
      <Header
        carritoAbierto={carritoAbierto}
        setCarritoAbierto={setCarritoAbierto}
        reloadCart={reloadCart}
      />
      <main className="p-4">
        <Outlet />
      </main>
      <CarritoSidebar
        isOpen={carritoAbierto}
        onClose={() => setCarritoAbierto(false)}
        onCartChange={() => setReloadCart((r) => r + 1)}
      />
    </>
  );
}

export default MainLayout;