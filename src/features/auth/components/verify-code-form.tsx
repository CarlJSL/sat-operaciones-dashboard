import { Loader2, RefreshCwIcon, AlertCircle } from "lucide-react";
import { cn } from "@/core/lib/utils";
import { Badge } from "@/components/ui/badge";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Controller, useFormContext } from "react-hook-form";
import type { VerifyCodeFormulario } from "@/domain/auth";

interface FormProps extends React.ComponentProps<"div"> {
  isPending?: boolean;
  serverError?: string | null;
  correo?: string;
  onResend?: () => void; // ← nueva prop
  isResending?: boolean;
}

export function VerifyCodeForm({
  className,
  isPending = false,
  isResending = false,
  onResend,
  correo = "",
  serverError,
  ...props
}: FormProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext<VerifyCodeFormulario>();

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <div className="flex flex-col items-center justify-center gap-1 text-center mb-2 w-full">
            <CardTitle className="text-center text-2xl font-bold">
              RFM Análisis
            </CardTitle>
            <CardDescription className="text-center">
              Verificación de código
            </CardDescription>
          </div>
          <CardDescription className="mt-2 mb-2 text-sm text-center">
            Ingresa el código de verificación enviado al Correo Electrónico:{" "}
            <Badge>
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
          <Field>
            <div className="flex items-center justify-between mb-5">
              <FieldLabel htmlFor="otp-verification">
                Código de Verificación
              </FieldLabel>
              <Button
                className="cursor-pointer"
                type="button" // ← IMPORTANTE: type="button" para que no haga submit
                variant="outline"
                size="xs"
                onClick={onResend} // ← ejecuta el handler
                disabled={isResending} // ← se deshabilita mientras reenvía
              >
                <RefreshCwIcon className={isResending ? "animate-spin" : ""} />
                {isResending ? "Enviando..." : "Reenviar Código"}
              </Button>
            </div>

            <Controller
              name="code" // ← nombre del campo en el schema Zod
              control={control} // ← el control de useFormContext
              render={({ field }) => (
                <InputOTP
                  maxLength={6}
                  id="otp-verification"
                  value={field.value} // ← Controller le da el valor actual
                  onChange={field.onChange}
                  required
                  containerClassName="w-full justify-center"
                  pattern={REGEXP_ONLY_DIGITS}
                >
                  <InputOTPGroup className="*:data-[slot=input-otp-slot]:h-14 *:data-[slot=input-otp-slot]:w-12 md:*:data-[slot=input-otp-slot]:h-16 md:*:data-[slot=input-otp-slot]:w-16 *:data-[slot=input-otp-slot]:text-2xl md:*:data-[slot=input-otp-slot]:text-3xl">
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                  </InputOTPGroup>
                  <InputOTPSeparator className="mx-2" />
                  <InputOTPGroup className="*:data-[slot=input-otp-slot]:h-14 *:data-[slot=input-otp-slot]:w-12 md:*:data-[slot=input-otp-slot]:h-16 md:*:data-[slot=input-otp-slot]:w-16 *:data-[slot=input-otp-slot]:text-2xl md:*:data-[slot=input-otp-slot]:text-3xl">
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              )}
            />
          </Field>
          {errors.code && (
            <p className="text-sm text-destructive mt-2">
              {errors.code.message} {/* "El código debe tener 6 dígitos" */}
            </p>
          )}
        </CardContent>
        <CardFooter>
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
        </CardFooter>
      </Card>
    </div>
  );
}
