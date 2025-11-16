import { JwtPayload } from "jwt-decode";

export interface FirebaseClaims extends JwtPayload {
  user_id: string;
  email: string;
  name: string;
  profile: number;
}
