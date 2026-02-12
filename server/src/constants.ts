import { TaskPriority, TaskStatus } from "./models/task.model";

export const constants = {
    pagination: {
        PAGE_LIMIT_DEFAULT: 10,
        PAGE_INDEX_DEFAULT: 1,
    },
    task: {
        ASSIGNED_TO_POPULATION_POLICY: 'name email',
        PRIORITY_DEFAULT: TaskPriority.MEDIUM,
        STATUS_DEFAULT: TaskStatus.TODO,
    }
}