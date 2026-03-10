
/*
 * Copyright © 2026 DCS Corporation, 6909 Metro Park Drive Suite 500, Alexandria, VA 22310.
 * See the LICENSE file for rights & permissions.
 */

import { IconButton, IconButtonProps, ListItemButton, ListItemButtonProps } from "@mui/material";
import { createLink, Link } from "@tanstack/react-router";
import { forwardRef } from "react";

export const ListItemButtonLink = createLink(
  forwardRef((props: ListItemButtonProps<"a">, ref: React.ForwardedRef<HTMLAnchorElement>) => {
    return <ListItemButton {...props} ref={ref} component={Link} />;
  }),
);

export const IconButtonLink = createLink(
  forwardRef((props: IconButtonProps<"a">, ref: React.ForwardedRef<HTMLAnchorElement>) => {
    return <IconButton {...props} ref={ref} component={Link} />;
  }),
);
