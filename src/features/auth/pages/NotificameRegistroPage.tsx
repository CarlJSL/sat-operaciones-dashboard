import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { Loader2, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import loginImage from "@/assets/images/login-img.jpg";
import satHeaderLogo from "@/assets/logos/logosathd2.png";
import { wspService } from "@/features/auth/api/wsp.service";
import { LanguageSelector } from "@/shared/components/LanguageSelector";

function createVerificationCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function formatPeruPhone(telefono: string) {
  const digits = telefono.replace(/\D/g, "");
  const withoutCountryCode = digits.startsWith("51") ? digits.slice(2) : digits;

  return `+51${withoutCountryCode}`;
}

export default function NotificameRegistroPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { mutate, isPending } = useMutation({
    mutationFn: wspService.sendMessage,
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const correo = String(formData.get("correo") || "correo@demo.pe");
    const telefono = formatPeruPhone(String(formData.get("telefono") || ""));
    const codigo = createVerificationCode();

    mutate(
      {
        telefono,
        mensaje: `Tu código de verificación para Notifícame SAT es: ${codigo}`,
      },
      {
        onSuccess: () => {
          navigate("/verify-code", {
            state: { correo, telefono, codigo, flow: "notificame" },
          });
        },
      }
    );
  }

  return (
    <main className="relative flex min-h-svh items-center justify-center overflow-hidden bg-platform-blue p-3 text-platform-blue-foreground sm:p-6">
      <div className="pointer-events-none absolute inset-0 text-platform-blue-foreground/15 bg-[radial-gradient(circle_at_1px_1px,currentColor_1.25px,transparent_0)] bg-size-[26px_26px]" />
      <div className="pointer-events-none absolute inset-0 text-platform-blue-foreground/10 bg-[linear-gradient(135deg,currentColor_1px,transparent_1px),linear-gradient(45deg,currentColor_1px,transparent_1px)] bg-position-[0_0,14px_14px] bg-size-[56px_56px]" />

      <Card className="relative w-full max-w-5xl overflow-hidden border-0 bg-card/95 py-0 text-card-foreground shadow-2xl lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.85fr)] lg:gap-0">
        <div className="flex flex-col py-5 sm:py-7">
          <div className="flex justify-end px-4 sm:px-8">
            <LanguageSelector />
          </div>

          <CardHeader className="items-center gap-4 px-4 text-center sm:px-8">
            <div className="flex w-full justify-center">
              <img
                src={satHeaderLogo}
                alt="SAT"
                className="h-auto w-full max-w-36 object-contain sm:max-w-44"
              />
            </div>
            <div className="flex flex-col gap-2">
              <CardTitle className="text-xl font-semibold text-platform-blue sm:text-2xl">
                {t("platform.notify.register.title")}
              </CardTitle>
              <CardDescription>
                {t("platform.notify.register.description")}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="px-4 sm:px-8">
            <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
              <FieldGroup className="gap-5">
                <Field>
                  <FieldLabel htmlFor="tipo-documento">
                    {t("platform.notify.register.documentType")} *
                  </FieldLabel>
                  <Select required>
                    <SelectTrigger id="tipo-documento" className="w-full">
                      <SelectValue
                        placeholder={t(
                          "platform.notify.register.documentTypePlaceholder"
                        )}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="dni">DNI</SelectItem>
                        <SelectItem value="ce">
                          {t("platform.notify.register.foreignerCard")}
                        </SelectItem>
                        <SelectItem value="ruc">RUC</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>

                <Field>
                  <FieldLabel htmlFor="documento">
                    {t("platform.notify.register.document")} *
                  </FieldLabel>
                  <Input
                    id="documento"
                    inputMode="numeric"
                    placeholder={t("platform.notify.register.documentPlaceholder")}
                    required
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="telefono">
                    {t("platform.notify.register.phone")} *
                  </FieldLabel>
                  <Input
                    id="telefono"
                    name="telefono"
                    type="tel"
                    inputMode="tel"
                    placeholder={t("platform.notify.register.phonePlaceholder")}
                    required
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="correo">
                    {t("platform.notify.register.email")} *
                  </FieldLabel>
                  <Input
                    id="correo"
                    name="correo"
                    type="email"
                    placeholder="correo@empresa.com"
                    required
                  />
                </Field>

                <Field orientation="horizontal">
                  <Checkbox id="terminos" required />
                  <FieldContent>
                    <FieldLabel htmlFor="terminos">
                      {t("platform.notify.register.terms")} *
                    </FieldLabel>
                    <FieldDescription>
                      {t("platform.notify.register.authorization")}
                    </FieldDescription>
                  </FieldContent>
                </Field>

                <Field>
                  <div className="flex items-center gap-3 rounded-md border bg-background p-4">
                    <Checkbox id="recaptcha-mock" required />
                    <FieldContent>
                      <FieldTitle>
                        {t("platform.notify.register.notRobot")} *
                      </FieldTitle>
                    </FieldContent>
                    <ShieldCheck
                      className="ml-auto text-platform-blue"
                      aria-hidden="true"
                    />
                  </div>
                </Field>
              </FieldGroup>

              <Button
                type="submit"
                size="lg"
                className="w-full bg-platform-blue text-platform-blue-foreground hover:bg-platform-blue/90"
                disabled={isPending}
              >
                {isPending && (
                  <Loader2 data-icon="inline-start" className="animate-spin" />
                )}
                {isPending
                  ? "Enviando código..."
                  : t("platform.notify.register.submit")}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="justify-center px-4 sm:px-8">
            <Button asChild variant="link" className="text-platform-blue">
              <Link to="/inicio">
                {t("platform.notify.register.backToPlatform")}
              </Link>
            </Button>
          </CardFooter>
        </div>

        <div className="relative hidden min-h-full bg-muted lg:block">
          <img
            src={loginImage}
            alt={t("platform.notify.register.imageAlt")}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-platform-blue/20" />
        </div>
      </Card>
    </main>
  );
}
