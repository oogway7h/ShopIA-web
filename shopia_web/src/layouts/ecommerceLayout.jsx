import { Outlet } from "react-router-dom";
import Header from "../components/ecommerce/header";



function MainLayout() {
  return (
    <>
      <Header />
      <main className="p-4">
        <Outlet />
      </main>
    </>
  );
}

export default MainLayout;