import { CompletionStatus } from "./OattsModel"

/*
 * Copyright © 2026 DCS Corporation, 6909 Metro Park Drive Suite 500, Alexandria, VA 22310.
 * See the LICENSE file for rights & permissions.
 */

// This can be expanded to include other statuses like failed/passed.
export type Status = {
    completionStatus: CompletionStatus,
}