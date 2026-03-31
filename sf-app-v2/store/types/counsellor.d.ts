import { Nullable } from "../types";

export interface Session {
  id: string;
  counsellorId: string;
  name: string;
  designation: string;
}

export interface CounsellorState {
  sessions: Nullable<Session[]>;
  fetchSessions: () => Promise<Session[]>;
  requestSession: () => Promise<void>;
}
