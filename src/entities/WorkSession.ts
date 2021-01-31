export interface WorkSession {
  id: string;
  mostImportantTodoId?: string;
  activeTodoId?: string;
  todos: Set<string>;
  doneTasks: number;
  createdAt: Date;
  finishedAt?: Date;
}
