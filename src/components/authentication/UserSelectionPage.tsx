
/*
 * Copyright © 2026 DCS Corporation, 6909 Metro Park Drive Suite 500, Alexandria, VA 22310.
 * See the LICENSE file for rights & permissions.
 */

import { ListItemButtonLink } from "@/components/common/LinkButtons";
import User from "@/core/model/UserModel";
import { DeleteForever, MoreVert, WarningRounded } from "@mui/icons-material";
import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  ListItem,
  ListItemButton,
  Menu,
  MenuItem,
  MenuList,
  Typography,
} from "@mui/material";
import { useNavigate, useRouteContext, useRouter } from "@tanstack/react-router";
import { motion } from "motion/react";
import React, { useRef, useState } from "react";
import { DeleteUser } from "@/core/authentication/Authenticator";
import UserList from "@/components/onboarding/UserList";

export default function UserSelectionPage({ users }: { users: User[] }) {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  let resolve = useRef<(value: boolean) => void>(undefined);
  let reject = useRef<(value: boolean) => void>(undefined);

  const router = useRouter();

  function closeModal(modalResult: boolean) {
    setDeleteModalOpen(false);
    if (resolve.current) resolve.current(modalResult);
  }

  async function requestDeletion(user: User) {
    setDeleteModalOpen(true);
    const promise = new Promise((res, rej) => {
      resolve.current = res;
      reject.current = rej;
    });

    await promise.then(async (shouldDelete) => {
      if (shouldDelete) {
        await DeleteUser(user.email);
        router.invalidate();
      }
    });
  }
  return (
    <React.Fragment>
      <UserList>
        {users.map((user) => (
          <UserListItem key={user.id} user={user} deleteUser={requestDeletion} />
        ))}
        <Divider />
        <ListItem
          sx={{
            "& .MuiListItemButton-root": {
              opacity: 1,
              justifyContent: "center",
              paddingY: "5px",
            },
          }}
        >
          <ListItemButtonLink sx={{display: 'flex', justifyContent: 'center'}}to="/register">
            New User
          </ListItemButtonLink>
        </ListItem>
      </UserList>
      <Dialog open={deleteModalOpen} onClose={() => closeModal(false)}>
        <DialogTitle>
          <WarningRounded />
          Confirmation
        </DialogTitle>
        <Divider />
        <DialogContent>Are you sure you want to delete the user?</DialogContent>
        <DialogActions>
          <Button variant="contained" color="error" onClick={() => closeModal(true)}>
            Delete
          </Button>
          <Button variant="contained" color="secondary" onClick={() => closeModal(false)}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}

export function UserListItem({ user, deleteUser }: { user: User; deleteUser: (user: User) => Promise<void> }) {
  const { authentication } = useRouteContext({
    from: "/_authentication/login",
  });
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | undefined>(undefined);
  const menuOpen = Boolean(menuAnchor);
  const navigate = useNavigate();
  const router = useRouter();

  async function selectUser(user: User) {
    authentication.setUser(user);
    router.invalidate();
    await navigate({ to: "/dashboard" });
  }

  function handleMenuOpenClick(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
  }

  function handleMenuClose(pp: any) {
    setMenuAnchor(undefined);
    pp.stopPropagation();
  }

  return (
    <ListItem
      sx={{
        padding: 0,
        margin: 0,
        "& .MuiListItemButton-root": {
          opacity: 1,
        },
      }}
      key={user.email}
      onClick={() => selectUser(user)}
    >
      <ListItemButton sx={{ opacity: 1 }}>
        <Box
          sx={{
            paddingY: 1,
            width: "100%",
            display: "grid",
            alignItems: "center",
            gridTemplateColumns: "auto auto 1fr",
          }}
        >
          <Avatar sx={{ borderRadius: "50%" }}>
            {`${user.firstName.charAt(0).toUpperCase()}${user.lastName.charAt(0).toUpperCase()}`}
          </Avatar>
          <Box sx={{ ml: 1.5 }}>
            <Typography color="text.primary">
              {user.firstName} {user.lastName}
            </Typography>
            <Typography color="text.secondary">{user.email}</Typography>
          </Box>
          <Button
            size="medium"
            onClick={handleMenuOpenClick}
            sx={{
              maxWidth: "36px",
              maxHeight: "36px",
              "& .MuiButton-root": {
                borderRadius: "900px",
                backgroundColor: "red",
              },
              justifySelf: "end",
            }}
          >
            <MoreVert sx={{ color: "inherit" }} />
          </Button>
          <Menu
            open={menuOpen}
            component={motion.ul}
            onClose={handleMenuClose}
            anchorEl={menuAnchor}
            /*initial={{
            height: "50px",
            opacity: 0
          }}
          animate={{
            height: "auto",
            opacity: 1,
            transition: {duration: .25}
          }}
          // the exit animation doesn't seem to work at the moment so it's just here for reference
          exit={{
            height: 0,
            transition: {duration: .25}
          }}*/
            sx={{
              zIndex: "99999",
              p: 1,
              gap: 1,
              overflow: "hidden",
              inset: 0,
            }}
          >
            <MenuList>
              <MenuItem
                onClick={(e) => {
                  setMenuAnchor(undefined);
                  deleteUser(user);
                  e.stopPropagation();
                }}
              >
                <DeleteForever sx={{ color: "danger.plainColor" }} />
                Delete
              </MenuItem>
            </MenuList>
          </Menu>
        </Box>
      </ListItemButton>
    </ListItem>
  );
}
