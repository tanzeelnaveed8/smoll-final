export const getZegoGroupErrorMessage = (code: number) => {
  const errors: Record<number, string> = {
    6000501: "Invalid group information.",
    6000502: "You are already in this group. Unable to create again.",
    6000503: "Server error. Please try again later.",
    6000504: "This group already exists.",
    6000505: "You have reached the maximum group limit.",
    6000506: "You don’t have permission to create a group.",
    108004: "You are already a member of this group.",
    108005: "Invalid group ID.",
 
    6000601: "This group does not exist.",
    6000602: "You are already a member of this group.",
    6000603: "This group is full.",
    6000604: "You don’t have permission to join this group.",
    6000605: "Your request to join is pending approval.",
    6000606: "You cannot join this group.",
    6000607: "Unable to join. Try again later.",
    6000608: "Invalid group ID.",
    108037:"already belong to this group",
    6000701: "Group not found.",
    6000702: "You don’t have access to view group members.",
    6000703: "Unable to load members. Try again.",

    6000801: "You are not a member of this group.",
    6000802: "You don’t have permission for this action.",
    6000803: "Group owner cannot be removed.",
  };

  return errors[code] || "Something went wrong. Please try again.";
};