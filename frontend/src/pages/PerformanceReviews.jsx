
import { useEffect, useState } from "react";
import { getPerformanceReviews } from "../services/api";
import "./PerformanceReviews.css";

function PerformanceReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const data = await getPerformanceReviews();
        setReviews(data);
      } catch (err) {
        setError("Failed to load performance reviews.");
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  if (loading) {
    return (
      <div className="reviews-page">
        <h2>Loading performance reviews...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="reviews-page">
        <h2>{error}</h2>
      </div>
    );
  }

  return (
    <div className="reviews-page">
      <div className="reviews-header">
        <h1>Performance Reviews</h1>
        <p>Review employee performance, ratings, and goal achievements.</p>
      </div>

      <div className="reviews-count">
        Total Reviews: {reviews.length}
      </div>

      <div className="reviews-table-container">
        <table className="reviews-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Department</th>
              <th>Review Period</th>
              <th>Rating</th>
              <th>Goals Achieved</th>
              <th>Performance</th>
              <th>Reviewer</th>
              <th>Comments</th>
            </tr>
          </thead>

          <tbody>
            {reviews.map((review) => (
              <tr key={review.review_id}>
                <td>
                  <div className="review-employee-name">
                    {review.employee_name}
                  </div>
                  <span className="review-employee-id">
                    ID: {review.employee_id}
                  </span>
                </td>

                <td>{review.department_name}</td>
                <td>{review.review_period}</td>

                <td>
                  <span className="review-rating">
                    ★ {Number(review.rating).toFixed(2)}
                  </span>
                </td>

                <td>
                  {Number(review.goals_achieved).toFixed(0)}%
                </td>

                <td>
                  <span
                    className={`performance-badge performance-${(review.performance_level || "").toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    {review.performance_level}
                  </span>
                </td>

                <td>{review.reviewer_name}</td>
                <td className="review-comments">{review.comments}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PerformanceReviews;