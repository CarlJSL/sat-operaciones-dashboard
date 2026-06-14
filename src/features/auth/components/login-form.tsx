import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import type { LoginContext } from "@/domain/auth";
import { cn } from "@/core/lib/utils";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Input } from "@/components/ui/input";

interface LoginFormProps extends React.ComponentProps<"form"> {
  isPending?: boolean;
  serverError?: string | null;
}

export function LoginForm({
  className,
  isPending = false,
  serverError,
  ...props
}: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const { t } = useTranslation();
  const {
    register,
    formState: { errors },
  } = useFormContext<LoginContext>();

  return (
    <form className={cn("flex flex-col gap-6", className)} {...props}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">{t("auth.login.title")}</h1>
          <p className="text-sm text-balance text-muted-foreground">
            {t("auth.login.description")}
          </p>
        </div>

        {serverError && (
          <div className="flex items-center gap-2 rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
            <AlertCircle size={15} className="shrink-0" />
            {serverError}
          </div>
        )}

        <Field data-invalid={!!errors.correo}>
          <FieldLabel htmlFor="correo">{t("auth.login.emailLabel")}</FieldLabel>
          <Input
            id="correo"
            type="email"
            autoComplete="email"
            placeholder={t("auth.login.emailPlaceholder")}
            aria-invalid={!!errors.correo}
            {...register("correo")}
          />
          {errors.correo && (
            <FieldDescription className="text-destructive">
              {errors.correo.message}
            </FieldDescription>
          )}
        </Field>

        <Field data-invalid={!!errors.password}>
          <div className="flex items-center">
            <FieldLabel htmlFor="password">{t("auth.login.passwordLabel")}</FieldLabel>
            <Link
              to="/forgot-password"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              {t("auth.login.forgotPassword")}
            </Link>
          </div>
          <InputGroup>
            <InputGroupInput
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder={t("auth.login.passwordPlaceholder")}
              aria-invalid={!!errors.password}
              {...register("password")}
            />
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                type="button"
                size="icon-xs"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={
                  showPassword ? t("auth.login.hidePassword") : t("auth.login.showPassword")
                }
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
          {errors.password && (
            <FieldDescription className="text-destructive">
              {errors.password.message}
            </FieldDescription>
          )}
        </Field>

        <Field>
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending && <Loader2 size={15} className="animate-spin" />}
            {isPending ? t("auth.login.submitting") : t("auth.login.submit")}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
