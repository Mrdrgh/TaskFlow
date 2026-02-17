import { Subject, Observable } from "rxjs";
import { map, filter, tap, bufferTime, debounceTime, scan} from "rxjs/operators"
import { buffer } from "stream/consumers";

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

export interface ActivitySummary {
    userId: string;
    count: number;
    events: AppEvent[];
    period: string;
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
            tap((event) =>{
                console.log(`EventBus User ${userId} recieving: ${event.type}`)
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


    // advanced ops
    getDebouncedEvents(userId: string, debounceMS: number = 500): Observable<AppEvent> {
        return this.getUserEvents(userId).pipe(
            debounceTime(debounceMS),
            tap((event) => {
                console.log(`EventBus Debounced event after ${debounceMS}`, event.type);
            }) 
        );
    }

    getBufferedEvents(userId: string, bufferMS: number = 500): Observable<AppEvent[]> {
        return this.getUserEvents(userId).pipe(
            bufferTime(bufferMS),
            filter((events) => events.length > 0),
            tap((events) => {console.log(`EventBus Buffered ${events.length} events in ${bufferMS} ms`)})
        )
    }

    getActivitySummary(userId: string): Observable<ActivitySummary> {
        return this.getUserEvents(userId).pipe(
            scan((acc: ActivitySummary, event: AppEvent) => {
                return {
                    userId: event.userId,
                    count: acc.count + 1,
                    events: [...acc.events, event].slice(-10),
                    period: `${acc.events[0]?.timestamp || event.timestamp}`
                };
            }, {
                userId,
                count: 0,
                events: [],
                period: ''
            }),
            tap((summary) => {
                console.log(`EventBus Activity Summary: ${summary.count} events for user : ${userId}`)
            })
        );
    };
}


export const eventService = new EventService();