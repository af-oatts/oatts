import { useState } from "react";
import User from "@/core/model/UserModel";
import TermsAndConditions from "@/components/onboarding/TermsAndConditions";
import PersonalData from "@/components/onboarding/PersonalData";
import { InsertUser } from "@/core/authentication/Authenticator";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/_authentication/register")({
  component: RegistrationPage,
});

export default function RegistrationPage() {
  const [tcDone, setTcDone] = useState(false);
  const { authentication } = Route.useRouteContext();
  const navigate = useNavigate();

  const register = (firstName: string, lastName: string, email: string, accessionLocation: string) => {
    let user: User = {
      firstName: firstName,
      lastName: lastName,
      email: email,
      base: accessionLocation,
      statusFlags: [],
      roles: [],
    };
    InsertUser(user).then((_) => {
      authentication.setUser(user);
      navigate({ to: "/dashboard" });
    });
  }

  if (!tcDone) {
    return <TermsAndConditions onAccept={() => setTcDone(true)} />;
  }

  return <PersonalData onComplete={register} />;
}
