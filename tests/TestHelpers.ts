import { Task } from '../src/Task';

export function fromLine({
    line,
    path = '',
    precedingHeader = '',
}: {
    line: string;
    path?: string;
    precedingHeader?: string | null;
}) {
    return Task.fromLine({
        line,
        path,
        precedingHeader,
        sectionIndex: 0,
        sectionStart: 0,
        fallbackDate: null,
    })!;
}

export function createTasksFromMarkdown(tasksAsMarkdown: string, path: string, precedingHeader: string): Task[] {
    const taskLines = tasksAsMarkdown.split('\n');
    const tasks: Task[] = [];
    let parentTracker: Array<Task> = [];
    for (const line of taskLines) {
        // first parse of task is just to make sure it parses correctly
        const task = Task.fromLine({
            line: line,
            path: path,
            precedingHeader: precedingHeader,
            sectionIndex: 0,
            sectionStart: 0,
            fallbackDate: null,
        });
        if (task) {
            // if our indent is less than the tracker, we need to find which parent this belongs to
            if (parentTracker.length > 0 && task.indentation.length <= parentTracker.at(-1)!.indentation.length) {
                // we need to pop some from parentTracker
                for (let i = parentTracker.length - 1; i >= 0; i--) {
                    if (parentTracker[i]!.indentation.length >= task.indentation.length) {
                        parentTracker.pop();
                    }
                }
            }

            // and if we're at the same indent, then we need to replace the last task in the parentTracker
            if (parentTracker.length > 0) {
                // - x
                //     - x
                //   - task

                // add the new task as a subtask to the parent
                parentTracker.at(-1)!.pushSubTask(task);
            } else {
                // - x
                //     - x
                // - task

                tasks.push(task);
            }

            // add the new task to the parent tracker
            parentTracker.push(task);
        } else {
            // if it's not a task, reset the parent Tracker
            parentTracker = [];
        }
    }
    return tasks;
}
