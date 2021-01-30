export interface WorkSession {
  id: string;
  mostImportantTodoId?: string;
  activeTodoId?: string;
  todos: Set<string>;
  createdAt: Date;
  finishedAt?: Date;
}
