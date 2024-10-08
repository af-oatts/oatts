import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

import HelpRoundedIcon from "@mui/icons-material/HelpRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import { UserContext } from "@/contexts/UserContext";
import { useNavigate } from "@tanstack/react-router";
import { IconButtonLink } from "../common/LinkButtons";
import { AnimatePresence, motion } from "motion/react";
import { Button, Divider } from "@mui/material";
import ColorModeIconDropdown from "@/theme/ColorModeIconDropdown";
import { useSetOverlay } from "@/contexts/hooks/useOverlay";
import About from "./About";
import { Home } from "@mui/icons-material";

export default function DashboardHeader() {
  const navigate = useNavigate();
  const setOverlay = useSetOverlay();
  const [menuAnchor, setMenuAnchor] = React.useState<HTMLElement | undefined>(undefined);
  const menuOpen = Boolean(menuAnchor);
  const userContext = React.useContext(UserContext);
  const initials = `${userContext.user?.firstName[0].toUpperCase() ?? "?"}${userContext.user?.lastName[0].toUpperCase() ?? "?"}`;
  const email = userContext.user?.email ?? "unknown@email.com";
  const fullName = `${userContext.user?.firstName ?? "Unknown"} ${userContext.user?.lastName ?? "Unknown"}`;
  function handleLogout(_: React.MouseEvent<HTMLLIElement, MouseEvent>): void {
    userContext.logout();
    navigate({ to: "/login" });
  }

  function handleMenuOpen(args: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
    setMenuAnchor(args.currentTarget);
  }

  function handleMenuClose(): void {
    setMenuAnchor(undefined);
  }

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        alignItems: "center",
        gridTemplateRows: "auto",
        margin: "0px",
        height: "48px",
      }}
    >
      <IconButtonLink size="small" color="default" to="/dashboard" sx={{ gridColumn: "1", width: "80px" }}>
        <Home sx={{width: "100%", height:'100%'}}/>
      </IconButtonLink>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: "5px",
          justifySelf: "end",
          gridColumn: "2",
        }}
      >
        <ColorModeIconDropdown />
        <Button
          onClick={handleMenuOpen}
          size="small"
          variant="text"
          sx={{
            ":hover": { backgroundColor: "transparent" },
            padding: 0,
            maxWidth: "32px",
            maxHeight: "32px",
            borderRadius: "50%",
          }}
        >
          <Avatar sx={{ maxWidth: "32px", maxHeight: "32px", fontSize: "1em" }}>{initials}</Avatar>
        </Button>
        <AnimatePresence>
          <Menu
            open={menuOpen}
            anchorEl={menuAnchor}
            component={motion.ul}
            onClose={handleMenuClose}

            sx={{
              zIndex: "99999",
              p: 1,
              gap: 1,
              "--ListItem-radius": "var(--joy-radius-sm)",
              overflow: "hidden",
              inset: 0,
            }}
          >
            <MenuItem sx={{ transition: "inset 0.25s" }}>
              <Box sx={{ display: "flex", alignItems: "center", transition: "inset 0.25s" }}>
                <Avatar sx={{ borderRadius: "50%" }}>{initials}</Avatar>
                <Box sx={{ ml: 1.5 }}>
                  <Typography variant="h6" color="textPrimary">
                    {fullName}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {email}
                  </Typography>
                </Box>
              </Box>
            </MenuItem>
            <Divider />
            <MenuItem onClick={() => {setOverlay(<About/>); handleMenuClose();}}>
              <div style={{ paddingRight: "5px" }}>
                <HelpRoundedIcon />

              </div>
              About
            </MenuItem>

            <Divider />
            <MenuItem onClick={handleLogout}>
              <div style={{ paddingRight: "5px" }}>
                <LogoutRoundedIcon />
              </div>
              Log out
            </MenuItem>
          </Menu>
        </AnimatePresence>
      </Box>
    </Box>
  );
}
