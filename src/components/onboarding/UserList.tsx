
/*
 * Copyright © 2026 DCS Corporation, 6909 Metro Park Drive Suite 500, Alexandria, VA 22310.
 * See the LICENSE file for rights & permissions.
 */

import { List, ListProps } from "@mui/material";

export default function UserList(props: ListProps) {
  return (
    <>
      <List
        {...props}
        sx={{
          p: 0,
          gap: 1,
        }}
      >
        {props.children}
      </List>
    </>
  );
}
