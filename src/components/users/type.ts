export type UserFilterStatusType = 'active' | 'inactive' | 'all';

export type UserType = {
  id: number;
  username: string;
  active: boolean;
  createdAt: string;
};