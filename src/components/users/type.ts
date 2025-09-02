export type UserFilterStatusType = 'active' | 'inactive' | 'all';

export type UserType = {
  id: number;
  username: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
};