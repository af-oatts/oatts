import { useSetOverlay } from "@/contexts/hooks/useOverlay"
import { Button, Checkbox, FormControlLabel, FormGroup, Paper, Typography } from "@mui/material";
import Legalese from "../common/Legalese";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { v4 as uuidv4 } from 'uuid';
export default function InformedConsent({ onConsented }: { onConsented: (attestation: string) => void }) {
    const setOverlay = useSetOverlay();
    const { t } = useTranslation("informedConsent");
    const [accepted, setAccepted] = useState(false);
    const [attestation, setAttestation] = useState<string | null>(null);
    const consent = t("content");


    const onClickAway = () => {
        setOverlay(null);
    }


    const onChecked = (isChecked: boolean) => {
        if (isChecked) {
            const token = uuidv4(); // Timestamp should be enough but whatever.
            let attestObj = { timestamp: Date.now(), consentCopy: consent, idempotencyToken: token };
            setAttestation(JSON.stringify(attestObj));
        }
        setAccepted(isChecked);
    }


    return (
        <div
            style={{
                width: "100%",
                height: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "rgba(170, 170, 170, .4)",
            }}
            onClick={() => onClickAway()}
            onContextMenu={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClickAway();
            }}
        >
            <Paper
                sx={{
                    position: "relative",
                    overflowX: "clip",
                    width: 500,
                    mx: "auto",
                    py: 3,
                    px: 2,
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    borderRadius: "12px",
                    boxShadow: "md",
                }}
                variant="outlined"
                onClick={(e) => {
                    e.stopPropagation();
                }}
                onContextMenu={(e) => {
                    e.stopPropagation();
                }}
            >
                <div>
                    <Typography variant="h4" fontWeight="lg">
                        {t("header")}
                    </Typography>
                    <Typography variant="h6">{t("subheader")}</Typography>
                </div>

                <Legalese legaleseMd={consent} title={t("title")} />

                <div style={{ display: "flex", justifyContent: "center" }}>
                    <FormGroup>
                        <FormControlLabel
                            required
                            label={t("acceptText")}
                            control={
                                <Checkbox
                                    checked={accepted}
                                    onChange={(e) => onChecked(e.target.checked)}
                                />
                            }
                        />
                    </FormGroup>
                </div>

                <div
                    style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        marginTop: "auto",
                    }}
                >
                    <Button
                        variant="contained"
                        color="secondary"

                        disabled={!accepted}
                        onClick={() => { if (accepted && attestation != null) { onConsented(attestation); } }}

                    >
                        {t("continueButton")}
                    </Button>
                </div>
            </Paper >
        </div >
    );

}