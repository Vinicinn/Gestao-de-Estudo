export function HistoryCard({ userHistory, formatDate }) {
  return (
    <div className="home-card home-card-half">
      <p className="home-card-title">Histórico de revisões</p>
      <div className="home-history-scroll">
        {userHistory.length === 0 ? (
          <p className="home-empty">Nenhuma revisão registrada ainda.</p>
        ) : (
          userHistory.map((review) => (
            <div className="home-item" key={review.id}>
              <p className="home-item-title">{review.title}</p>
              <p className="home-item-sub">
                {review.source} · {formatDate(review.date)}
                {review.time ? ` às ${review.time}` : ""}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
