import { EventEmitter } from 'node:events';

export type TaskStatus = {
	id: string;
	progress: number;
	message: string;
	done: boolean;
};

class TaskManager extends EventEmitter {
	private tasks = new Map<string, TaskStatus>();

	get(id: string) {
		return this.tasks.get(id);
	}

	update(id: string, status: Partial<TaskStatus>) {
		const current = this.tasks.get(id) ?? { id, progress: 0, message: 'Starting...', done: false };
		const updated = { ...current, ...status };
		this.tasks.set(id, updated);
		this.emit(`update:${id}`, updated);
	}
}

export const taskManager = new TaskManager();
