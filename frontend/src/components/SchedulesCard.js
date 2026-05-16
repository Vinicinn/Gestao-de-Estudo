import { useNavigate } from "react-router-dom";

export function SchedulesCard({ deleteSchedule, userSchedules, reload, formatDate }) {
  const navigate = useNavigate();

  async function handleDeleteSchedule(contentId) {
    if (!window.confirm("Tem certeza que deseja excluir este agendamento?")) {
      return;
    }

    try {
      await deleteSchedule(contentId);
      await reload();
    } catch (error) {
      alert(error.message || "Erro ao excluir agendamento");
    }
  }

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
            <div className="home-item-text">
              <p className="home-item-title">
                {schedule.subject} - {schedule.topic}
              </p>
              <p className="home-item-sub">
                {formatDate(schedule.reviewDate)} às {schedule.time}
              </p>
            </div>
            <div>
              <button className="home-item-button" onClick={() => handleDeleteSchedule(schedule._id)}>
                x
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
