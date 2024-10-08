import { Button, Checkbox, FormControlLabel, FormGroup, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import Legalese from "@/components/common/Legalese";
import { useState } from "react";

export default function TermsAndConditions({ onAccept }: { onAccept: (acceptanceTimestamp: number, certificationTimestamp: number) => void }) {
  const { t } = useTranslation("termsAndConditions");
  let [acceptanceTime, setAcceptanceTime] = useState<number | null>(null);
  let [certifiedHasPermissionTime, setCertifiedHasPermissionTime] = useState<number | null>(null);

  return (
    <>
      <div>
        <Typography variant="h4" fontWeight='bold'>
          {t("header")}
        </Typography>
        <Typography variant="h6">{t("subheader")}</Typography>
      </div>


      <Legalese legaleseMd={t("content")} title={t("title")} />


      <FormGroup>
        <FormControlLabel required label={t("acceptTerms")} control={
          <Checkbox
            aria-label={t("acceptTerms")}
            style={{float: 'left'}}
            checked={acceptanceTime != null}
            onChange={(_, checked) => setAcceptanceTime(checked ? new Date().getTime() : null)}
          />
        } />

        <FormControlLabel required label={t("certifyPermission")} control={
          <Checkbox
            aria-label={t("certifyPermission")}
            style={{float: 'left'}}
            checked={certifiedHasPermissionTime != null}
            onChange={(_, checked) => setCertifiedHasPermissionTime(checked ? new Date().getTime() : null)}
          />
        } />


      </FormGroup >

      <Button
        sx={{ mt: 1 }}
        disabled={acceptanceTime == null || certifiedHasPermissionTime == null}
        onClick={() => onAccept(acceptanceTime!, certifiedHasPermissionTime!)}
      >
        Continue
      </Button>
    </>
  );
}
