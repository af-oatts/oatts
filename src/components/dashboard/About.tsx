import { useSetOverlay } from "@/contexts/hooks/useOverlay"
import { Paper } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { ConfettiButton } from "../common/Confetti";
import getOattsVersion from "@/core/utils/Version";

export default function About() {
    const setOverlay = useSetOverlay();
    const [appVersion, setAppVersion] = useState<string | undefined>();
    const [contentVersion, setContentVersion] = useState<string | undefined>();
    const paperRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        getOattsVersion().then(v => {
            setAppVersion(v.appVersion);
            setContentVersion(v.contentVersion);
        })
    }, []);

    // Close overlay only when the user clicks outside the Paper
    useEffect(() => {
        function onDocMouseDown(e: MouseEvent) {
            if (!paperRef.current) return;
            const target = e.target as Node | null;
            if (!target) return;
            if (!paperRef.current.contains(target)) {
                setOverlay(null);
            }
        }
        document.addEventListener("mousedown", onDocMouseDown);
        return () => document.removeEventListener("mousedown", onDocMouseDown);
    }, [setOverlay]);

    return <div style={{ width: "100%", height: "100%", justifyContent: "center", alignContent: "center", textAlign: "center", backgroundColor: 'rgba(170, 170, 170, .4)' }}>

        <Paper
            component="div"
            ref={paperRef}
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
            onContextMenu={(e) => { e.stopPropagation(); }} // this is ok
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
                    <a href="https://af-oatts.github.io/legal/license" target="_blank">License</a>
                    <a href="https://af-oatts.github.io/legal/third-party" target="_blank">Third Party Licenses</a>
                    <a href="https://af-oatts.github.io/legal/credits" target="_blank">Credits</a>
                    <a href="https://af-oatts.github.io/legal/terms-conditions" target="_blank">Terms & Conditions</a>
                </div>
            </div>
        </Paper>
    </div>
}