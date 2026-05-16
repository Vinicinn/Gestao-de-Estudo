import { useNavigate } from "react-router-dom";

export function SchedulesCard({ userSchedules, formatDate }) {
  const navigate = useNavigate();

  return (
    <div className="home-card home-card-half">
      <div className="card-header">
        <p className="home-card-title">Agendamentos</p>
        <button className="card-header-button" onClick={() => navigate("/schedule")}>
          +
        </button>
      </div>
      {userSchedules.length === 0 ? (
        <p className="home-empty">Nenhum agendamento cadastrado.</p>
      ) : (
        userSchedules.map((schedule) => (
          <div className="home-item" key={schedule._id}>
            <p className="home-item-title">
              {schedule.subject} - {schedule.topic}
            </p>
            <p className="home-item-sub">
              {formatDate(schedule.reviewDate)} às {schedule.time} · {schedule.duration} min
            </p>
          </div>
        ))
      )}
    </div>
  );
}
