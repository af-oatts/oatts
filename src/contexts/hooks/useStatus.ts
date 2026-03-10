import { useContext, useMemo } from "react";
import { StatusContext } from "../StatusContext";
import { Status } from "@/core/model/Status";
import { CompletionStatus, Course } from "@/core/model/OattsModel";
import { FlattenContents, FlattenCourse } from "@/utils/Flattener";

/*
 * Copyright © 2026 DCS Corporation, 6909 Metro Park Drive Suite 500, Alexandria, VA 22310.
 * See the LICENSE file for rights & permissions.
 */
export function useStatus(contentID: string) {
    const { statuses } = useContext(StatusContext);
    return statuses?.get(contentID);
}

export function useCourseStatus(course: Course | undefined) {
    if (course == undefined) {
        return undefined;
    }
    const contents = FlattenContents(course.contents);
    const ids = useMemo(() => contents.filter(c => !c.children).map(c => c.id), [contents]);
    const statuses = useStatuses(ids);

    return useMemo(() => {
        if (!statuses) return undefined;
        const values = Array.from(statuses.values());
        if (values.every(s => s?.completionStatus === CompletionStatus.Completed)) return CompletionStatus.Completed;
        if (values.every(s => s == undefined || s?.completionStatus === CompletionStatus.NotStarted)) return CompletionStatus.NotStarted;
        return CompletionStatus.Started;
    }, [statuses]);
}

export function useStatuses(contentIds: string[]): Map<string, Status | undefined> | undefined {
    const { statuses } = useContext(StatusContext);

    return useMemo(() => {
        if (!statuses) return undefined;
        return contentIds.reduce<Map<string, Status | undefined>>(
            (acc, id) => acc.set(id, statuses.get(id)),
            new Map()
        );
    }, [statuses, contentIds]);
}

export function useAllStatuses(): Map<string, Status | undefined> | undefined {
    const { statuses } = useContext(StatusContext);
    return statuses;
}

export function useSetStatus() {
    const { setStatus } = useContext(StatusContext);
    return setStatus;
}


export function useIsComplete(courses: Course[]) {
    const contentIds = courses.reduce((acc : string[], course) => [...acc, ...FlattenCourse(course).filter(content => !content.children).map(c => c.id)], []);
    const statuses = useStatuses(contentIds);
    const isComplete = useMemo(() => contentIds?.every(id => statuses?.get(id)?.completionStatus === CompletionStatus.Completed), [statuses]);
    return isComplete;
}