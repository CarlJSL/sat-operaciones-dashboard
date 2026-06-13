import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import { verifyCodeSchema, type VerifyCodeFormulario } from "@/domain/auth";
import { authService } from "@/features/auth/api/auth.service";
import { AuthPageLayout } from "@/features/auth/components/auth-page-layout";
import { useSuccessStore } from "@/shared/store/successStore";
import { queryClient } from "@/app/providers/QueryProvider";
import { VerifyCodeForm } from "../components/verify-code-form";

export default function VerifyCodePage() {
  const location = useLocation();
  const navigate = useNavigate();

  const { correo } = location.state as { correo: string };

  const methods = useForm<VerifyCodeFormulario>({
    resolver: zodResolver(verifyCodeSchema),
    defaultValues: { code: "" },
    mode: "onBlur",
    reValidateMode: "onChange",
  });

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
      methods.reset({ code: "" }); // Borra el código incorrecto para que intente de nuevo
    },
  });

  const { mutate: resend, isPending: isResending } = useMutation({
    mutationFn: () => authService.forgotPasword(correo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth"] });

      useSuccessStore.getState().show({
        title: "Código reenviado",
        description: `Se ha enviado un nuevo código`,
      });
    },
  });

  return (
    <AuthPageLayout>
      <FormProvider {...methods}>
        <form
          onSubmit={methods.handleSubmit((data) => mutate(data))}
          noValidate
          className="w-full max-w-120"
        >
          <VerifyCodeForm
            isPending={isPending}
            correo={correo}
            onResend={() => resend()} // ← handler como prop
            isResending={isResending}
          />
        </form>
      </FormProvider>
    </AuthPageLayout>
  );
}
