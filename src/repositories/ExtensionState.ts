import { TodoRepository } from './TodoRepository';
import { WorkSessionRepository } from './WorkSessionRepository';

export interface ExtensionState {
  todos: TodoRepository;
  workSession: WorkSessionRepository;
}
