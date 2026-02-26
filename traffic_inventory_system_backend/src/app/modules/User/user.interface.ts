export interface TUser {
  id?: number;
  username: string;
  email: string;
  password: string;
  role: "admin" | "user";
}

export type TLoginUser = {
  email: string;
  password: string;
};

export type TUserRole = "admin" | "user";
