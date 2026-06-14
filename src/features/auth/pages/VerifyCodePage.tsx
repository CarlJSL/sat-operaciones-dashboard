import { Controller, FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Loader2, Mail, RefreshCwIcon } from "lucide-react";
import { REGEXP_ONLY_DIGITS } from "input-otp";

import { queryClient } from "@/app/providers/QueryProvider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { verifyCodeSchema, type VerifyCodeFormulario } from "@/domain/auth";
import { authService } from "@/features/auth/api/auth.service";
import { wspService } from "@/features/auth/api/wsp.service";
import { useSuccessStore } from "@/shared/store/successStore";
import satHeaderLogo from "@/assets/logos/logosathd2.png";

type VerifyCodeState = {
  correo?: string;
  telefono?: string;
  codigo?: string;
  flow?: "notificame";
};

export default function VerifyCodePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = (location.state ?? {}) as VerifyCodeState;
  const correo = state.correo ?? "correo@demo.pe";
  const telefono = state.telefono ?? "+51999999999";
  const codigo = state.codigo ?? "";
  const isNotificameFlow = state.flow === "notificame";
  const verificationTarget = isNotificameFlow ? telefono : correo;

  const methods = useForm<VerifyCodeFormulario>({
    resolver: zodResolver(verifyCodeSchema),
    defaultValues: { code: "" },
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  const {
    control,
    formState: { errors },
  } = methods;

  const { mutate, isPending } = useMutation({
    mutationFn: (data: VerifyCodeFormulario) =>
      authService.verifyCode({ correo, codigo: data.code }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["auth"] });

      navigate("/reset-password", {
        state: { correo, codigo: variables.code },
      });
    },
    onError: () => {
      methods.reset({ code: "" });
    },
  });

  const { mutate: resend, isPending: isResending } = useMutation({
    mutationFn: () => {
      if (isNotificameFlow) {
        return wspService.sendMessage({
          telefono,
          mensaje: `Tu código de verificación para Notifícame SAT es: ${codigo}`,
        });
      }

      return authService.forgotPasword(correo);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth"] });

      useSuccessStore.getState().show({
        title: "Código reenviado",
        description: isNotificameFlow
          ? "Se ha enviado un nuevo código al teléfono registrado."
          : "Se ha enviado un nuevo código",
      });
    },
  });

  function handleSubmit(data: VerifyCodeFormulario) {
    if (isNotificameFlow) {
      if (codigo && data.code !== codigo) {
        methods.setError("code", {
          type: "validate",
          message: "El código ingresado no coincide.",
        });
        methods.setValue("code", "");
        return;
      }

      navigate("/notificame/confirmacion", {
        state: { correo, telefono, codigo: data.code },
      });
      return;
    }

    mutate(data);
  }

  function handleResend() {
    resend();
  }

  return (
    <main className="relative flex min-h-svh items-center justify-center overflow-hidden bg-platform-blue p-3 text-platform-blue-foreground sm:p-6">
      <div className="pointer-events-none absolute inset-0 text-platform-blue-foreground/15 bg-[radial-gradient(circle_at_1px_1px,currentColor_1.25px,transparent_0)] bg-size-[26px_26px]" />
      <div className="pointer-events-none absolute inset-0 text-platform-blue-foreground/10 bg-[linear-gradient(135deg,currentColor_1px,transparent_1px),linear-gradient(45deg,currentColor_1px,transparent_1px)] bg-position-[0_0,14px_14px] bg-size-[56px_56px]" />

      <Card className="relative w-full max-w-2xl border-0 bg-card/95 py-6 text-card-foreground shadow-2xl sm:py-8">
        <CardHeader className="items-center gap-5 px-4 text-center sm:px-8">
          <div className="flex w-full justify-center">
            <img
              src={satHeaderLogo}
              alt="SAT"
              className="h-auto w-full max-w-36 object-contain sm:max-w-44"
            />
          </div>
          <div className="flex w-full justify-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-platform-blue/10 text-platform-blue">
              <Mail className="size-7" aria-hidden="true" />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <CardTitle className="text-xl font-semibold text-platform-blue sm:text-2xl">
              {isNotificameFlow ? "Verifica tu teléfono" : "Verifica tu correo"}
            </CardTitle>
            <CardDescription>
              Ingresa el código de 6 dígitos enviado a{" "}
              <Badge variant="secondary" className="align-middle">
                {verificationTarget}
              </Badge>
            </CardDescription>
          </div>
          {isNotificameFlow && (
            <CardDescription>
              Este paso valida tu teléfono antes de activar las notificaciones.
            </CardDescription>
          )}
        </CardHeader>

        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(handleSubmit)} noValidate>
            <CardContent className="px-4 sm:px-8">
              <Field>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <FieldLabel htmlFor="otp-verification">
                    Código de verificación
                  </FieldLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleResend}
                    disabled={isResending}
                  >
                    <RefreshCwIcon
                      data-icon="inline-start"
                      className={isResending ? "animate-spin" : undefined}
                    />
                    {isResending ? "Enviando..." : "Reenviar código"}
                  </Button>
                </div>

                <Controller
                  name="code"
                  control={control}
                  render={({ field }) => (
                    <InputOTP
                      maxLength={6}
                      id="otp-verification"
                      value={field.value}
                      onChange={field.onChange}
                      required
                      containerClassName="w-full justify-center"
                      pattern={REGEXP_ONLY_DIGITS}
                    >
                      <InputOTPGroup className="*:data-[slot=input-otp-slot]:h-11 *:data-[slot=input-otp-slot]:w-10 *:data-[slot=input-otp-slot]:text-xl sm:*:data-[slot=input-otp-slot]:h-14 sm:*:data-[slot=input-otp-slot]:w-12 sm:*:data-[slot=input-otp-slot]:text-2xl">
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                      </InputOTPGroup>
                      <InputOTPSeparator className="mx-1 sm:mx-2" />
                      <InputOTPGroup className="*:data-[slot=input-otp-slot]:h-11 *:data-[slot=input-otp-slot]:w-10 *:data-[slot=input-otp-slot]:text-xl sm:*:data-[slot=input-otp-slot]:h-14 sm:*:data-[slot=input-otp-slot]:w-12 sm:*:data-[slot=input-otp-slot]:text-2xl">
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  )}
                />
                {errors.code && (
                  <FieldDescription className="text-destructive">
                    {errors.code.message}
                  </FieldDescription>
                )}
              </Field>
            </CardContent>

            <CardFooter className="flex-col gap-3 px-4 pt-6 sm:px-8">
              <Button
                type="submit"
                size="lg"
                className="w-full bg-platform-blue text-platform-blue-foreground hover:bg-platform-blue/90"
                disabled={isPending}
              >
                {isPending && <Loader2 data-icon="inline-start" className="animate-spin" />}
                {isPending ? "Validando..." : "Verificar código"}
              </Button>
              <Button asChild variant="link" className="text-platform-blue">
                <Link to={isNotificameFlow ? "/notificame/registro" : "/forgot-password"}>
                  Volver
                </Link>
              </Button>
            </CardFooter>
          </form>
        </FormProvider>
      </Card>
    </main>
  );
}
