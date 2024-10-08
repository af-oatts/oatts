import { useSetOverlay } from "@/contexts/hooks/useOverlay"
import { Paper } from "@mui/material";
import { useEffect, useState } from "react";
import { ConfettiButton } from "../common/Confetti";
import getOattsVersion from "@/core/utils/Version";
export default function About() {
    const setOverlay = useSetOverlay();
    const [appVersion, setAppVersion] = useState<string | undefined>();
    const [contentVersion, setContentVersion] = useState<string | undefined>();
    const onClickAway = () => {
        setOverlay(null);
    }

    useEffect(() => {
        getOattsVersion().then(v => {
            setAppVersion(v.appVersion);
            setContentVersion(v.contentVersion);
        })
    }, []);

    return <div style={{ width: "100%", height: "100%", justifyContent: "center", alignContent: "center", textAlign: "center", backgroundColor: 'rgba(170, 170, 170, .4)' }} onClick={() => onClickAway()} onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); onClickAway(); }}>

        <Paper
            sx={{
                position: "relative",
                overflowX: "clip",
                width: 500,
                mx: "auto", // margin left & right
                py: 3, // padding top & bottom
                px: 2, // padding left & right
                display: "flex",
                flexDirection: "column",
                gap: 2,
                borderRadius: "12px",
                boxShadow: "md",
            }}
            variant="outlined"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
            onContextMenu={(e) => { e.stopPropagation(); }}
        >
            <div>
                <div style={{ fontSize: "50px", display: "flex", textAlign: "center", width: "100%", alignContent: "center", justifyContent: "center" }}>
                    <b style={{ paddingRight: "5px" }}>
                        O.A.T.T.S.
                    </b>
                    {/* CONFETTI!!! YAYY!!!! 🎉🎉🎉🎉🎉🎉🎉 */}
                    <ConfettiButton options={{ zIndex: 99999, get angle() { return Math.random() * 360 } }}><img src="/icon.png" width="50px" /></ConfettiButton>
                </div>
                <h4>Official AFOQT & TBAS Test-familiarization Software</h4>
                <p>Software Version <b>{appVersion ?? "loading..."}</b> </p>
                <p>Content Version <b>{contentVersion ?? "loading..."}</b> </p>
                <hr></hr>
            </div>
            <p>Created for the United States Air Force</p>
            <div>
                <hr></hr>
                <div style={{ display: "flex", textAlign: "center", width: "100%", alignContent: "center", justifyContent: "center", gap: "10px" }}>
                    <a href="https://raw.githubusercontent.com/af-oatts/oatts/refs/heads/main/THIRD_PARTY_LICENSES">Licenses</a>
                    <a href="https://raw.githubusercontent.com/af-oatts/oatts/refs/heads/main/CREDITS">Credits</a>
                    <a href="https://raw.githubusercontent.com/af-oatts/oatts/refs/heads/main/TERMS_AND_CONDITIONS">Terms & Conditions</a>
                    <a href="https://raw.githubusercontent.com/af-oatts/oatts/refs/heads/main/PRIVACY_POLICY">Privacy Policy</a>
                </div>
            </div>


        </Paper>
    </div>
}