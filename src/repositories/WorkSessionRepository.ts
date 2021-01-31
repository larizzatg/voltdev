import * as vscode from 'vscode';
import { v4 as uuidv4 } from 'uuid';
import { WorkSession } from '../entities/WorkSession';
import { WorkSessionAnalytic } from '../entities/WorkSessionAnalytic';
import { Todo } from '../entities/Todo';

const STORAGE_KEY_WORK_SESSION_ACTIVE = 'store.work-session.active';
const STORAGE_KEY_WORK_SESSION_ANALYTICS = 'store.work-session.analytics';
const ERROR_SESSION_EMPTY = new Error('A work session must exist');

type WorkSessionState = WorkSession & { todos: string[] };

export class WorkSessionRepository {
  session: WorkSession | undefined;
  static state: vscode.Memento;

  constructor(context: vscode.ExtensionContext) {
    WorkSessionRepository.state = context.globalState;
    this.session = this.getState();
  }

  async startWorkSession(): Promise<void> {
    this.session = {
      id: uuidv4(),
      createdAt: new Date(),
      todos: new Set()
    };
    await this.updateState();
  }

  async finisWorkSession(todos: Todo[]): Promise<WorkSessionAnalytic> {
    if (!this.session) {
      return Promise.reject(ERROR_SESSION_EMPTY);
    }
    this.session.finishedAt = new Date();
    let completedTodoQty = 0;
    let mostImportantTodoCompleted = false;

    todos.forEach((todo) => {
      if (todo.done) {
        completedTodoQty += 1;
      }
      if (this.session?.mostImportantTodoId === todo.id) {
        mostImportantTodoCompleted = todo.done;
      }
    });

    const analytic: WorkSessionAnalytic = {
      workSessionId: this.session.id,
      startedAt: this.session.createdAt,
      finishedAt: this.session.finishedAt,
      todosQuantity: todos.length,
      completedTodos: completedTodoQty,
      todos: todos,
      mostImportantTodoId: this.session.mostImportantTodoId,
      mostImportantTodoCompleted: mostImportantTodoCompleted
    };

    await this.saveAnalytic(analytic);
    await this.clearState();
    return analytic;
  }

  async setMostImportantTodo(id: string): Promise<void> {
    if (!this.session) {
      return Promise.reject(ERROR_SESSION_EMPTY);
    }
    this.session.mostImportantTodoId = id;
    await this.updateState();
  }

  async setActiveTodo(id: string): Promise<void> {
    if (!this.session) {
      return Promise.reject(ERROR_SESSION_EMPTY);
    }
    this.session.activeTodoId = id;
    await this.updateState();
  }

  async addTodos(todoIds: string[]): Promise<void> {
    if (!this.session) {
      await this.startWorkSession();
    }
    if (!this.session) {
      return Promise.reject(ERROR_SESSION_EMPTY);
    }
    this.session.todos = new Set<string>([...this.session.todos, ...todoIds]);
    await this.updateState();
  }

  async deleteTodo(id: string): Promise<void> {
    if (!this.session) {
      return Promise.resolve();
    }
    this.session.todos.delete(id);

    if (this.session.activeTodoId == id) {
      this.session.activeTodoId = undefined;
    }

    if (this.session.mostImportantTodoId == id) {
      this.session.mostImportantTodoId = undefined;
    }

    await this.updateState();
  }

  getState(): WorkSession | undefined {
    const workSessionState = WorkSessionRepository.state.get<WorkSessionState>(
      STORAGE_KEY_WORK_SESSION_ACTIVE
    );

    if (!workSessionState) {
      return;
    }

    const workSession: WorkSession = Object.assign({}, workSessionState, {
      todos: new Set<string>([...workSessionState.todos])
    });

    return workSession;
  }

  async updateState(): Promise<void> {
    if (!this.session) {
      return Promise.reject(ERROR_SESSION_EMPTY);
    }
    const sessionToSave: WorkSessionState = Object.assign({}, this.session, {
      todos: [...this.session.todos.values()]
    });

    await WorkSessionRepository.state.update(
      STORAGE_KEY_WORK_SESSION_ACTIVE,
      sessionToSave
    );
  }

  async clearState(): Promise<void> {
    this.session = undefined;
    await WorkSessionRepository.state.update(
      STORAGE_KEY_WORK_SESSION_ACTIVE,
      undefined
    );
  }

  getAnalytics(): WorkSessionAnalytic[] {
    const workSessionAnalytics = WorkSessionRepository.state.get<
      WorkSessionAnalytic[]
    >(STORAGE_KEY_WORK_SESSION_ANALYTICS, []);

    return workSessionAnalytics;
  }

  async saveAnalytic(analytic: WorkSessionAnalytic): Promise<void> {
    const pastAnalytics = this.getAnalytics();
    pastAnalytics.unshift(analytic);
    await WorkSessionRepository.state.update(
      STORAGE_KEY_WORK_SESSION_ANALYTICS,
      pastAnalytics
    );
  }

  async clearAnalytics(): Promise<void> {
    await WorkSessionRepository.state.update(
      STORAGE_KEY_WORK_SESSION_ANALYTICS,
      []
    );
  }
}
