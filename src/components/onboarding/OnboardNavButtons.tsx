
/*
 * Copyright © 2026 DCS Corporation, 6909 Metro Park Drive Suite 500, Alexandria, VA 22310.
 * See the LICENSE file for rights & permissions.
 */

import { alpha, Button, ButtonProps } from "@mui/material";
import { ReactNode } from "@tanstack/react-router";

function OnboardNavButton(props: ButtonProps) {
  return <>
    <Button color="primary" sx={[(theme) => ({
      paddingY: "30px", gridColumn: "4", gridRow: "2", borderRadius: "20px", borderWidth: "1px", borderColor: theme.palette.primary.main, borderStyle: "solid",
      boxShadow: `0px 0px 8px ${alpha(theme.palette.primary.main, 0.75)}`,
    }), ...(Array.isArray(props.sx) ? props.sx : [props.sx].filter(Boolean))]} disabled={props.disabled} onClick={props.onClick}>
      {props.children}
    </Button>
  </>
}

export function NextButton({ children, disabled, onClick }: { children: ReactNode, disabled?: boolean, onClick?: () => void }) {
  return <OnboardNavButton disabled={disabled} onClick={onClick} sx={{ gridColumn: "4", gridRow: "2" }}>{children}</OnboardNavButton>
}

export function PreviousButton({ children, disabled, onClick }: { children: ReactNode, disabled?: boolean, onClick?: () => void }) {
  return <OnboardNavButton disabled={disabled} onClick={onClick} sx={{ gridColumn: "2", gridRow: "2" }}>{children}</OnboardNavButton>
}

export function ContinueButton({ children, disabled, onClick }: { children: ReactNode, disabled?: boolean, onClick?: () => void }) {
  return <OnboardNavButton disabled={disabled} onClick={onClick} sx={{ gridColumn: "3", gridRow: "2", columnSpan: "2" }}>{children}</OnboardNavButton>
}