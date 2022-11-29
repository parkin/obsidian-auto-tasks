/**
 * @jest-environment jsdom
 */
// import { Task } from '../src/Task';

import { createTasksFromMarkdown } from './TestHelpers';

describe('createTasksFromMarkdown', () => {
    it('parses a single task correctly', () => {
        const tasksAsMarkdown = `
- [ ] Task 3
            `;

        const tasks = createTasksFromMarkdown(tasksAsMarkdown, 'some_markdown_file', 'Some Heading');

        expect(tasks.length).toBe(1);
        expect(tasks[0].description).toBe('Task 3');
    });

    it('parses multiple lines of just parent tasks', () => {
        const tasksAsMarkdown = `
- [ ] Task 3
- [ ] Task 4
- [ ] some other task
            `;

        const tasks = createTasksFromMarkdown(tasksAsMarkdown, 'some_markdown_file', 'Some Heading');

        expect(tasks.length).toBe(3);
        expect(tasks[0].description).toBe('Task 3');
        expect(tasks[1].description).toBe('Task 4');
        expect(tasks[2].description).toBe('some other task');
    });

    it('can parse subtasks', () => {
        const tasksAsMarkdown = `
- [ ] Task 3
    - [ ] Task 4
- [ ] some other task
            `;

        const tasks = createTasksFromMarkdown(tasksAsMarkdown, 'some_markdown_file', 'Some Heading');

        // Only expect 2 parent tasks
        expect(tasks.length).toBe(2);
        expect(tasks[0].description).toBe('Task 3');
        expect(tasks[1].description).toBe('some other task');

        // Task 3 sould have subtasks
        expect(tasks[0].subtasks.length).toBe(1);
        expect(tasks[0].subtasks[0].description).toBe('Task 4');

        // the subtasks should have a parent
        expect(tasks[0].subtasks[0].parentTask!.description).toBe('Task 3');

        // some tasks should have no subtasks
        expect(tasks[1].subtasks.length).toBe(0);
        expect(tasks[0].subtasks[0].subtasks.length).toBe(0);
    });

    it('resets parents after blank lines', () => {
        const tasksAsMarkdown = `
- [ ] Task 3

    - [ ] Task 4
- [ ] some other task
            `;

        const tasks = createTasksFromMarkdown(tasksAsMarkdown, 'some_markdown_file', 'Some Heading');

        expect(tasks.length).toBe(3);
        expect(tasks[0].description).toBe('Task 3');
        expect(tasks[1].description).toBe('Task 4');
        expect(tasks[2].description).toBe('some other task');
    });

    it('can parse multiple levels of subtasks', () => {
        const tasksAsMarkdown = `
- [ ] Task 3
    - [ ] Task 4
    - [ ] Task 5
      - [ ] inception task
    - [ ] Task 6
- [ ] some other task
            `;

        const tasks = createTasksFromMarkdown(tasksAsMarkdown, 'some_markdown_file', 'Some Heading');

        expect(tasks.length).toBe(2);
        expect(tasks[0].description).toBe('Task 3');
        expect(tasks[1].description).toBe('some other task');

        expect(tasks[0].subtasks.length).toBe(3);
        expect(tasks[0].subtasks[0].description).toBe('Task 4');
        expect(tasks[0].subtasks[1].description).toBe('Task 5');
        expect(tasks[0].subtasks[2].description).toBe('Task 6');

        expect(tasks[0].subtasks[0].subtasks.length).toBe(0);
        expect(tasks[0].subtasks[1].subtasks.length).toBe(1);
        expect(tasks[0].subtasks[1].subtasks[0].description).toBe('inception task');
        expect(tasks[0].subtasks[2].subtasks.length).toBe(0);
    });
});
