export function RecommendationsCard({ userRecommendations, formatDate }) {
  return (
    <div className="home-card">
      <p className="home-card-title">Recomendação de Revisões</p>
      {userRecommendations.length === 0 ? (
        <p className="home-empty">Nenhuma recomendação no momento.</p>
      ) : (
        userRecommendations.map((content) => (
          <div className="home-item" key={content._id}>
            <div className="home-item-text">
              <p className="home-item-title">{content.name}</p>
              <p className="home-item-sub">
                {content.subject} · Revisão: {formatDate(content.nextReview)}
              </p>
            </div>
            <div>
              <button className="home-item-button">Concluir</button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
