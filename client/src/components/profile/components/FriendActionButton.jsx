import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

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
        <span>Loading...</span>
      </div>
    );
  }

  return (
    <div className="action-el friend" onClick={() => mutation.mutate(userId)}>
      <FontAwesomeIcon icon={icon} />
      <span>{label}</span>
    </div>
  );
};
