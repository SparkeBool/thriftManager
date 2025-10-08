import React, { useEffect, useState } from "react";
import {
  TrendingUp,
  Users,
  DollarSign,
  PieChart,
  Clock,
  Zap,
} from "react-feather";

const iconMap = {
  Users: <Users size={24} />,
  DollarSign: <DollarSign size={24} />,
  PieChart: <PieChart size={24} />,
};

const Dashboard = () => {
  const [stats, setStats] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/dashboard/stats", { credentials: "include" }).then((res) =>
        res.json()
      ),
      fetch("/api/dashboard/activities", { credentials: "include" }).then(
        (res) => res.json()
      ),
    ])
      .then(([statsData, activitiesData]) => {
        const mappedStats = statsData.map((stat) => ({
          ...stat,
          icon: iconMap[stat.icon] || <Users size={24} />,
        }));
        setStats(mappedStats);
        setRecentActivities(activitiesData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-5">Loading...</div>;

  return (
    <div className=" min-vh-100 py-5">
      <div className="container-fluid">
        {/* Stats Cards */}
        <div className="mb-5">
          <h2 className="h4 fw-bold mb-4 d-flex align-items-center text-secondary px-3 px-md-4 px-lg-5">
            <TrendingUp size={20} className="me-2 text-primary" />
            Overview Statistics
          </h2>
          <div className="row g-4 justify-content-center px-3 px-md-4 px-lg-5">
            {stats.map((stat, index) => (
              <div className="col-xl-4 col-lg-6 col-md-6" key={index}>
                <div
                  className="card shadow-md h-100 border-0 rounded-4 overflow-hidden animate__animated animate__fadeInUp"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="card-body p-4">
                    <div className="d-flex align-items-start justify-content-between">
                      <div>
                        <div
                          className="d-flex align-items-center justify-content-center rounded-3 mb-3 p-3"
                          style={{
                            backgroundColor: stat.bgColor,
                            width: "fit-content",
                          }}
                        >
                          <span className="text-white">{stat.icon}</span>
                        </div>
                        <h5 className="card-title text-secondary fw-semibold mb-2">
                          {stat.title}
                        </h5>
                        <p className="h2 fw-bold text-dark mb-0">
                          {stat.value}
                        </p>
                      </div>
                      <div className="text-end">
                        <span
                          className={`badge ${
                            stat.trend === "up"
                              ? "bg-success-subtle text-success"
                              : "bg-danger-subtle text-danger"
                          } rounded-pill px-3 py-2 fw-bold`}
                        >
                          {stat.trend === "up" ? (
                            <i className="bi bi-arrow-up me-1"></i>
                          ) : (
                            <i className="bi bi-arrow-down me-1"></i>
                          )}
                          {stat.growth}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="row g-4 px-3 px-md-4 px-lg-5">
          {/* Recent Activities */}
          <div className="col-lg-6">
            <div className="card shadow-sm h-100 border-0 rounded-4 animate__animated animate__fadeInLeft">
              <div className="card-body p-4">
                <h2 className="h4 fw-bold mb-4 d-flex align-items-center text-secondary">
                  <Clock size={20} className="me-2 text-primary" />
                  Recent Activities
                </h2>
                <div className="list-group list-group-flush border-top border-bottom py-2">
                  {recentActivities.map((activity, index) => (
                    <div
                      className="list-group-item border-0 px-0 py-3 d-flex align-items-center"
                      key={index}
                    >
                      <div className="me-3 fs-4 text-primary">
                        {activity.icon}
                      </div>
                      <div className="flex-grow-1">
                        <h6 className="mb-1 fw-semibold text-dark">
                          {activity.action}
                        </h6>
                        <small className="text-muted">{activity.time}</small>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="text-center mt-3">
                  <button className="btn btn-outline-primary btn-sm rounded-pill px-4">
                    View All Activities
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="col-lg-6">
            <div className="card shadow-sm h-100 border-0 rounded-4 animate__animated animate__fadeInRight">
              <div className="card-body p-4">
                <h2 className="h4 fw-bold mb-4 d-flex align-items-center text-secondary">
                  <Zap size={20} className="me-2 text-primary" />
                  Quick Actions
                </h2>
                <div className="row g-3">
                  <div className="col-sm-6">
                    <button
                      href="/create-thrift"
                      className="btn btn-primary w-100 py-3 d-flex flex-column align-items-center justify-content-center rounded-3 shadow-sm transition-hover-scale"
                    >
                      <i className="bi bi-plus-circle-fill d-block fs-2 mb-2"></i>
                      <span className="fw-semibold">Create Thrift</span>
                    </button>
                  </div>
                  <div className="col-sm-6">
                    <button className="btn btn-success w-100 py-3 d-flex flex-column align-items-center justify-content-center rounded-3 shadow-sm transition-hover-scale">
                      <i className="bi bi-cash-coin d-block fs-2 mb-2"></i>
                      <span className="fw-semibold">Add Contribution</span>
                    </button>
                  </div>
                  <div className="col-sm-6">
                    <button className="btn btn-info text-white w-100 py-3 d-flex flex-column align-items-center justify-content-center rounded-3 shadow-sm transition-hover-scale">
                      <i className="bi bi-people-fill d-block fs-2 mb-2"></i>
                      <span className="fw-semibold">Manage Members</span>
                    </button>
                  </div>
                  <div className="col-sm-6">
                    <button className="btn btn-warning text-white w-100 py-3 d-flex flex-column align-items-center justify-content-center rounded-3 shadow-sm transition-hover-scale">
                      <i className="bi bi-bar-chart-fill d-block fs-2 mb-2"></i>
                      <span className="fw-semibold">View Reports</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
