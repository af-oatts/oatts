import { Box, Button, FormControl, FormLabel, MenuItem, Select, Stack, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { UserExists } from "@/core/authentication/Authenticator";
import { useTranslation } from "react-i18next";

type FormError = {
  email?: string;
};

export default function PersonalData({
  onComplete,
}: {
  onComplete(firstName: string, lastName: string, email: string, accessionLocation: string): void;
}) {
  const [error, setError] = useState<FormError>({});
  const { t } = useTranslation("welcome");
  const centers = t("accessionCenters", { returnObjects: true }) as string[];

  return (
    <>
      <Typography variant="h4" component="h1" fontWeight="bold">
        Please Answer These Questions:
      </Typography>

      <form
        onSubmit={async (event) => {
          event.preventDefault();

          const formData = new FormData(event.currentTarget);
          const formJson = Object.fromEntries((formData as any).entries());
          const userExists = await UserExists(formJson.email);
          if (userExists) {
            setError({ email: "Email already exists" });
            return;
          }
          onComplete(formJson.firstname, formJson.lastname, formJson.email, formJson.accessionLocation);
        }}
      >
        <Stack gap={4}>
          <Stack gap={2}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <FormControl required>
                <FormLabel>First Name</FormLabel>
                <TextField type="name" name="firstname" placeholder="John" />
              </FormControl>
              <FormControl required>
                <FormLabel>Last Name</FormLabel>
                <TextField type="name" name="lastname" placeholder="Smith" />
              </FormControl>
            </Box>
            <FormControl error={error.email !== undefined} required>
              <FormLabel>Email (use .mil email if you have one)</FormLabel>
              <TextField type="email" name="email" placeholder="john.smith.1@us.af.mil" />
              {error.email ? (
                <Typography variant="caption" sx={{ color: "error.light" }}>
                  {error.email}
                </Typography>
              ) : null}
            </FormControl>
            <FormControl required>
              <FormLabel>Accession Location</FormLabel>
              <Select defaultValue="" name="accessionLocation">
                {centers.map((accessionCenter) => (
                  <MenuItem value={accessionCenter} key={accessionCenter}>
                    {accessionCenter}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>

          <Button sx={{ mt: 1 /* margin top */ }} type="submit">
            Continue
          </Button>
        </Stack>
      </form>
    </>
  );
}
