import { useNavigate } from "react-router-dom";

export function ContentsCard({ deleteContent, userContents, reload, reviewHistory }) {
  const navigate = useNavigate();

  async function handleDeleteContent(contentId) {
    if (!window.confirm("Tem certeza que deseja excluir este conteúdo?")) {
      return;
    }

    try {
      await deleteContent(contentId);
      await reload();
    } catch (error) {
      alert(error.message || "Erro ao excluir conteúdo");
    }
  }

  return (
    <div className="home-card">
      <div className="card-header">
        <p className="home-card-title">Meus conteúdos</p>
        <button className="card-header-button" onClick={() => navigate("/content")}>
          +
        </button>
      </div>
      <div className="home-history-scroll">
        {userContents.length === 0 ? (
          <p className="home-empty">Nenhum conteúdo cadastrado.</p>
        ) : (
          userContents.map((content) => (
            <div className="home-item" key={content._id}>
              <div className="home-item-text">
                <p className="home-item-title">{content.name}</p>
                <p className="home-item-sub">{content.subject}</p>
              </div>
              <div className="home-item-goal">
                <p className="home-item-feedback-quantity">
                  Revisões: {reviewHistory.filter((r) => r.contentId?.toString() === content._id?.toString()).length}
                </p>
                <p className="home-item-feedback-goal">Meta: {content.goal}</p>
              </div>
              <div>
                <button className="home-item-button" onClick={() => handleDeleteContent(content._id)}>
                  x
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
