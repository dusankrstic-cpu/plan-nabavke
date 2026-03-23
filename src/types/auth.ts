export interface User {
  id: string;
  role: string;
}

export interface AuthenticatedRequest {
  user?: User;
}