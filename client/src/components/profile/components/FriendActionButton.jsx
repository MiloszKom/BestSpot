import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Spinner from "../../common/Spinner";

export const FriendActionButton = ({
  icon,
  label,
  mutation,
  userId,
  isFetching,
}) => {
  if (mutation.isPending || isFetching) {
    return (
      <div className="action-el friend">
        <Spinner />
      </div>
    );
  }

  return (
    <button
      className="action-el friend"
      onClick={() => mutation.mutate(userId)}
      disabled={mutation.isPending || mutation.isFetching}
    >
      <FontAwesomeIcon icon={icon} />
      <span>{label}</span>
    </button>
  );
};
