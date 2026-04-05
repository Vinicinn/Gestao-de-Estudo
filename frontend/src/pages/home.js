import { Link } from "react-router-dom";

export function Home() {
  return (
    <div>
      <h1>Dashboard de Estudos</h1>
      <Link to="/study">Registrar Novo Estudo</Link>
      {/*listar estudos, revisões, etc. */}
    </div>
  );
}