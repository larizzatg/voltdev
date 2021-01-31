# ⚡ Voltdev

Voltdev is a virtual assistant that will help you on your daily tasks as a developer.

## Features

**Todo List**

- Create: Don't forget a thing, add it to your todo list and it will be there until is completion or obviation.
- Edit: Made a typo? No fear, you can edit any of your tasks.
- Delete: Life is uncertain, that's why you have the option to delete tasks that you're not longer interested in.
- Complete: Done some work today? Complete that task and give you a clap for all your hard work.

**Work Session**

- Start Work Session: Pick a group of your saved tasks to work on.
- End Work Session: End your work session, you'll be notified how many tasks you did. WIP Analytics
- Most Important Task: Choose which is your most important task
- Active Task: Focus on one bit a time.

**Rest**

- Take a rest to feed your mind, exercise your body or connect with your soul.

**Stack OverFlow**

- Search questions in stack overflow, the only thing you need to do is select the text and it will search in your editor language.

  _Need gifs or video of extension_

## Installation

**As a user**
Install from the [vscode marketplace](https://marketplace.visualstudio.com/items?itemName=larizzatg.voltdev)

**As a contributor**

- Download repository
- In the root, run `npm install`
- Open root with vscode `code voltdev`
- Open a terminal in the root and watch for changes `npm run watch`
- Press F5 to run the extension in debug mode

## Release Notes

### v0.2.1-alpha

**Fixes**

- rename todo for tasks in ui

### v0.2.0-alpha

**Features**

- work session analytics
- complete the active task from the sidebar
- when all tasks are done ask for task or end session
- status bar session
- have active task button
- rest option

**Fixes**

- remove active todo from the status bar if done
- don't show info message when 0 todos are done
- completed todos notification
- add to session todos completed out of session
- create a session if a todo is completed without it
- when todos are empty and the user try to complete ask for new todo
- when todos are empty and the user try to edit ask for new todo
- when todos are empty and the user try to delete ask for new todo
- ask for another todo if active is completed
- confirm to restart the session
- use the same active task icon
- only end the session when existing one
- message when the task was edited

### v0.1.0-alpha

**Features**

Open StackOverflow with the selected text in the active editor with the tags of the editor language.

### v0.0.1-alpha

**Features**

- Manage todos and save them in the global state of vscode
- Start and finish a session, setting up the active task and most important task
