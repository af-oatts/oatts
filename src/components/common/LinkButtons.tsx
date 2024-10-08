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
