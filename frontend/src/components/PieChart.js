import { Pie } from "react-chartjs-2";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";
Chart.register(ArcElement, Tooltip, Legend);

export function PieChart({ data, title }) {
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        data: data.values,
        backgroundColor: [
          "#36A2EB",
          "#FF6384",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
          "#FF9F40",
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div style={{ width: 300, margin: "0 auto" }}>
      <h3 style={{ textAlign: "center" }}>{title}</h3>
      <Pie data={chartData} options={{ responsive: true, plugins: { legend: { position: "bottom" } } }} />
    </div>
  );
}
