import { Todo } from './Todo';

export interface WorkSessionAnalytic {
  workSessionId: string;
  startedAt: Date;
  finishedAt: Date;
  todosQuantity: number;
  completedTodos: number;
  mostImportantTodoCompleted: boolean;
  mostImportantTodoId?: string;
  todos: Todo[];
}
