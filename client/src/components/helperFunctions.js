import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStarHalfStroke } from "@fortawesome/free-solid-svg-icons";
import { faStar as emptyStar } from "@fortawesome/free-regular-svg-icons";
import { faStar as filledStar } from "@fortawesome/free-solid-svg-icons";

export function measureDistance(position1, position2) {
  const R = 6371e3; // metres
  const φ1 = (position1.lat * Math.PI) / 180; // φ, λ in radians
  const φ2 = (position2.lat * Math.PI) / 180;
  const Δφ = ((position2.lat - position1.lat) * Math.PI) / 180;
  const Δλ = ((position2.lng - position1.lng) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const d = R * c; // in metres

  return d;
}

export function starRating(rating) {
  const stars = [];

  for (let i = 1; i <= 5; i++) {
    if (rating >= i) {
      stars.push(<FontAwesomeIcon key={i} icon={filledStar} />);
    } else if (rating >= i - 0.5) {
      stars.push(<FontAwesomeIcon key={i} icon={faStarHalfStroke} />);
    } else {
      stars.push(<FontAwesomeIcon key={i} icon={emptyStar} />);
    }
  }

  return stars;
}
