import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import PublicPageGate from "./PublicPageGate";

function Layout() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <PublicPageGate>
          <Outlet />
        </PublicPageGate>
      </main>
      <Footer />
    </div>
  );
}

export default Layout;
