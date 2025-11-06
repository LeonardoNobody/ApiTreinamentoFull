import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Forgot from "./pages/Forgot";
import Reset from "./pages/Reset";
import Dashboard from "./pages/Dashboard";
import Guard from "./components/_TmpGuard";
import Catalog from "./pages/Catalog";
import Product from "./pages/Product";
import Vendor from "./pages/Vendor";
import VendorNew from "./pages/VendorNew";

function Navbar() {
  return (
    <header className="border-b bg-white">
      <nav className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center gap-4 text-sm">
        <Link to="/" className="font-semibold text-slate-900">OptikTrack</Link>

        <Link to="/login" className="text-slate-600 hover:text-slate-900">Login</Link>
        <Link to="/register" className="text-slate-600 hover:text-slate-900">Registro</Link>
        <Link to="/forgot" className="text-slate-600 hover:text-slate-900">Esqueci senha</Link>

        <span className="mx-2 text-slate-400">|</span>

        <Link to="/catalogo" className="text-slate-600 hover:text-slate-900">
          Catálogo
        </Link>
        <Link to="/fornecedor/novo" className="text-slate-600 hover:text-slate-900">
          Novo Fornecedor
        </Link>
      </nav>
    </header>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Guard><Dashboard/></Guard>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot" element={<Forgot />} />
        <Route path="/reset-password" element={<Reset />} />
        <Route path="*" element={<Navigate to="/" replace />} />
        <Route path="/catalogo" element={<Catalog />} />
        <Route path="/produto/:id" element={<Product />} />
        <Route path="/fornecedor/novo" element={<VendorNew />} />
        <Route path="/fornecedor/:id" element={<Vendor />} />
      </Routes>
    </BrowserRouter>
  );
}
