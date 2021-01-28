export interface TodoInput {
  title: string;
  description: string;
}

export interface Todo extends TodoInput {
  id: string;
  done: boolean;
  createdAt: Date;
  updatedAt: Date;
  completedAt: Date | undefined;
}
