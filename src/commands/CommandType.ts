export enum CommandType {
  CLEAR_STATE = 'voltdev.state.clear',
  TODO_NEW = 'voltdev.todo.new',
  TODO_EDIT = 'voltdev.todo.edit',
  TODO_COMPLETE = 'voltdev.todo.complete',
  TODO_DELETE = 'voltdev.todo.delete',
  WORK_SESSION_START = 'voltdev.work-session.start',
  WORK_SESSION_END = 'voltdev.work-session.end',
  WORK_SESSION_ADD_TASKS = 'voltdev.work-session.tasks.add',
  WORK_SESSION_SET_MIT = 'voltdev.work-session.tasks.mit',
  WORK_SESSION_SET_ACTIVE_TASK = 'voltdev.work-session.tasks.active',
  WORK_SESSION_COMPLETE_ACTIVE_TASK = 'voltdev.work-session.tasks.active.complete',
  STACK_OVERFLOW_SEARCH = 'voltdev.stack-overflow.search'
}
