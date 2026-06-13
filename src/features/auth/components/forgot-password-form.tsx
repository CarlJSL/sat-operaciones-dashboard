import { useFormContext } from "react-hook-form";
import { Loader2, AlertCircle } from "lucide-react";
import type { ForgotPasswordForm } from "@/domain/auth";
import { cn } from "@/core/lib/utils";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

interface LoginFormProps extends React.ComponentProps<"div"> {
  isPending?: boolean;
  serverError?: string | null;
}

export function ForgotPassForm({
  className,
  isPending = false,
  serverError,
  ...props
}: LoginFormProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext<ForgotPasswordForm>();

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <div className="flex flex-col items-center justify-center gap-1 text-center mb-2 w-full">
            <CardTitle className="text-center text-2xl font-bold">
              SAT
            </CardTitle>
            <CardDescription className="text-center">
              Recuperación de contraseña
            </CardDescription>
          </div>
          <CardDescription className="text-center mt-3 mb-2">
            Recibirás un código de verificación en tu correo registrado para
            restablecer tu contraseña.
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
            <Field data-invalid={!!errors.correo}>
              <FieldLabel htmlFor="usuario">Correo Electrónico</FieldLabel>
              <Input
                id="correo"
                type="email"
                placeholder="correo@gmail.com"
                aria-invalid={!!errors.correo}
                {...register("correo")}
              />
              {errors.correo && (
                <FieldDescription className="text-destructive">
                  {errors.correo.message}
                </FieldDescription>
              )}
            </Field>
            {/* Submit */}
            <Field>
              <Button
                type="submit"
                className="cursor-pointer w-full h-12 text-base font-semibold mb-5"
                disabled={isPending}
              >
                {isPending && <Loader2 size={15} className="animate-spin" />}
                {isPending ? "Enviando…" : "Enviar código"}
              </Button>
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>
    </div>
  );
}
