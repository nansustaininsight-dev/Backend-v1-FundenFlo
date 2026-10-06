export type AuthUser = {
  id: string;
  mobile: string;
  role: 'borrower';
};

export type PublicUser = {
  id: string;
  mobile: string;
  fullName?: string;
  pan?: string;
  dob?: string;
};

export type AuthSession = {
  token: string;
  refreshToken: string;
  user: PublicUser;
};
