import { create } from "zustand";

type MemberProfile = {
  name?: string | null;
  profileImg?: string | null;
  id?: string | null;
};

interface GroupMemberStore {
  members: Record<string, MemberProfile>;
  upsertMembers: (payload: Record<string, MemberProfile>) => void;
  reset: () => void;
}

export const useGroupMemberStore = create<GroupMemberStore>((set) => ({
  members: {},
  upsertMembers: (payload) =>
    set((state) => ({   
      members: {
        ...state.members,
        ...payload,
      },
    })),
  reset: () => set({ members: {} }),
}));

