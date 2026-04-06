import { useEffect, useState } from "react";
import "../styles/home.css";
import { api } from "../services/api";
import { useNavigate } from "react-router-dom";

export function Home({ user }) {
  const [contents, setContents] = useState([]);
  const navigate = useNavigate();

  const today = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  useEffect(() => {
    async function loadData() {
      try {
        const data = await api.getUserContents(user.id);
        setContents(data);
        console.log(data);
        
      } catch (error) {}
    }
    loadData();
  }, [user.id]);

  return (
    <div className="home-page">
      <div className="home-header">
        <h1>Olá, {user.name}</h1>
        <span>{today}</span>
      </div>
      <div className="home-window">
        <div className="home-card">
          <div className="card-header">
            <p className="home-card-title">Meus conteúdos</p>
            <button
              className="card-header-button"
              onClick={() => navigate("/content")}
            >
              +
            </button>
          </div>
          {contents.length === 0 ? (
            <p className="home-empty">Nenhum conteúdo cadastrado.</p>
          ) : (
            contents.map((content) => (
              <div className="home-item" key={content._id}>
                <p className="home-item-title">{content.name}</p>
                <p className="home-item-sub">{content.subject}</p>
              </div>
            ))
          )}
        </div>
        <div className="home-card">
          <p className="home-card-title">Recomendação de Revisões</p>
          <p className="home-empty">Nenhuma recomendação cadastrado.</p>
        </div>
        <div className="home-card">
          <div className="card-header">
          <p className="home-card-title">Agendamentos</p>
          <button className="card-header-button" onClick={()=> {navigate("/schedule")}}>+</button>
          </div>
          <p className="home-empty">Nenhum agendamento cadastrado.</p>
        </div>
      </div>
    </div>
  );
}
