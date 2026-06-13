import { Loader2, AlertCircle, EyeOff, Eye } from "lucide-react";
import { cn } from "@/core/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

import { useFormContext } from "react-hook-form";
import type { ResetPasswordForm } from "@/domain/auth";
import { useState } from "react";

interface FormProps extends React.ComponentProps<"div"> {
  isPending?: boolean;
  serverError?: string | null;
  correo?: string;
}

export function ResetPassForm({
  className,
  isPending = false,
  correo = "",
  serverError,
  ...props
}: FormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    formState: { errors },
  } = useFormContext<ResetPasswordForm>();

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <div className="flex flex-col items-center justify-center gap-1 text-center mb-2 w-full">
            <CardTitle className="text-center text-2xl font-bold">
              SAT
            </CardTitle>
            <CardDescription className="text-center">
              Restablecer contraseña
            </CardDescription>
          </div>
          <CardTitle className="text-center text-lg">
            Cambiar Contraseña
          </CardTitle>
          <CardDescription className="mt-5 mb-2 text-sm text-center">
            Ingresa tu nueva contraseña para la cuenta:{" "}
            <Badge className="mt-5 text-base">
              <span className="font-medium">{correo}</span>
            </Badge>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {serverError && (
            <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2.5 mb-5">
              <AlertCircle size={15} className="shrink-0" />
              {serverError}
            </div>
          )}
          <FieldGroup>
            <Field data-invalid={!!errors.nuevoPassword}>
              <div className="flex items-center justify-between">
                <FieldLabel htmlFor="password">Contraseña</FieldLabel>
              </div>
              <InputGroup>
                <InputGroupInput
                  id="nuevoPassword"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Ingresar contraseña"
                  aria-invalid={!!errors.nuevoPassword}
                  {...register("nuevoPassword")}
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupButton
                    type="button"
                    size="icon-xs"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={
                      showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                    }
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
              {errors.nuevoPassword && (
                <FieldDescription className="text-destructive">
                  {errors.nuevoPassword.message}
                </FieldDescription>
              )}
            </Field>

            <Field data-invalid={!!errors.confirmarPassword}>
              <div className="flex items-center justify-between">
                <FieldLabel htmlFor="confirmarPassword">Confirmar contraseña</FieldLabel>
              </div>
              <InputGroup>
                <InputGroupInput
                  id="confirmarPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Confirmar contraseña"
                  aria-invalid={!!errors.confirmarPassword}
                  {...register("confirmarPassword")}
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupButton
                    type="button"
                    size="icon-xs"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    aria-label={
                      showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                    }
                  >
                    {showConfirmPassword ? <EyeOff /> : <Eye />}
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
              {errors.confirmarPassword && (
                <FieldDescription className="text-destructive">
                  {errors.confirmarPassword.message}
                </FieldDescription>
              )}
            </Field>

            <Field>
              <Button
                type="submit"
                className="cursor-pointer w-full h-12 text-base font-semibold mb-5"
                disabled={isPending}
              >
                {isPending && <Loader2 size={15} className="animate-spin" />}
                {isPending ? "Procesando…" : "Cambiar Contraseña"}
              </Button>
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>
    </div>
  );
}
