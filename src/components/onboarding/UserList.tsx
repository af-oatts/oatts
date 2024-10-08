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
