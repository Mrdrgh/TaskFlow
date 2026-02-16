import { Subject, Observable } from "rxjs";
import { map, filter} from "rxjs/operators"

export enum EventType {
    TASK_CREATED = 'task:created',
    TASK_UPDATED = 'task:updated',
    TASK_DELETED = 'task:deleted',
    TASK_STATUS_CHANGED = 'task:status_changed',
    TASK_PRIORITY_CHANGED = 'task:priority_changed'
};

export interface AppEvent {
    type: EventType;
    userId: string;
    data: any;
    timestamp: Date;
}

class EventService {
    private eventStream$ = new Subject<AppEvent>();

    emit(type: EventType, userId: string, data: any): void {
        const event: AppEvent = {
            type,
            userId,
            data,
            timestamp: new Date(),
        }

        console.log(`Event bus Emitting: ${event.type} for user ${event.userId}`);
        this.eventStream$.next(event);
    }

    getEventStream(): Observable<AppEvent> {
        return this.eventStream$.asObservable();
    }

    getUserEvents(userId: string): Observable<AppEvent> {
        return this.eventStream$.pipe(
            filter((event) => event.userId === userId),
            map((event) => {
                console.log(`User ${userId} recieving ${event.type}`);
                return event;
            })
        );
    }

    getEventBytype(eventType: EventType): Observable<AppEvent> {
        return this.eventStream$.pipe(
            filter((event) => event.type === eventType)
        );
    }

    getTaskEvents(userId: string): Observable<AppEvent> {
        return this.eventStream$.pipe(
            filter((event) => event.userId === userId),
            filter((event) => event.type.startsWith('task:'))
        );
    }
}


export const eventService = new EventService();