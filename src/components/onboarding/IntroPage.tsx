import { Box, Typography } from "@mui/material";
import { motion } from "motion/react";
import { TransitionParams } from "../../theme/TransitionParams";
import { useTranslation } from "react-i18next";
import { NextButton } from "./OnboardNavButtons";

export default function IntroPage({ onNext }: { onNext: () => void }) {
  const { t } = useTranslation("welcome");
  return (
    <>
      <Box
        display="grid"
        gridTemplateColumns="50px 200px 1fr 200px 50px"
        gridTemplateRows="1fr auto auto"
        gap="50px 10px"
        width="100%"
        height="100%"
        sx={(theme) => ({ background: theme.palette.background.gradient })}
      >
        <Box
          sx={{
            gridColumn: "1 / span 5",
            gridRow: "1",
          }}
        >
          <Box
            display="flex"
            gap="20px"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            sx={{ height: "100%" }}
          >
            <img src="/airforce.svg" alt="logo" style={{ height: "400px" }} />
            <Typography
              key="welcomeSign"
              component={motion.span}
              {...TransitionParams({ endOpacity: 0.8 })}
              variant="h1"
            >
              {t("title")}
            </Typography>
            <Typography
              key="welcomeText"
              component={motion.span}
              {...TransitionParams({ delay: 0.25 })}
              variant="body1"
            >
              {t("subtitle")}
            </Typography>
          </Box>
        </Box>

        <NextButton onClick={onNext}>
          {t("confirmButton")}
        </NextButton>

      </Box>
        <p style={{fontSize: '10px', padding: '0 10px'}}>
        The Air Force Symbol is a United States Registered Trademark (Reg. No. 2,767,190), is owned by the Department of the Air Force (“DAF”), and is used with permission herein. The appearance of external hyperlinks herein is for informational purposes only does not constitute endorsement by the DAF of any linked website, or the information, content, products, or services contained therein.  DAF takes no position on the information and content contained herein and makes no representations or warranties of any kind whatsoever, express or implied, including with respect to the accuracy, completeness, or fitness for purpose of the information and content contained at any linked website or at any subsequent links.  Under no circumstances shall DAF be liable for any damages (including but not limited to direct, indirect, incidental, consequential, special or exemplary damages) arising out of or in connection with the presence of DAF intellectual property herein or based on the information and content made available herein.
        </p>
    </>
  );
}
