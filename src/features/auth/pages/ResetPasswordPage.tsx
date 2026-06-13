import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import { resetPasswordSchema, type ResetPasswordForm } from "@/domain/auth";
import { authService } from "@/features/auth/api/auth.service";
import { AuthPageLayout } from "@/features/auth/components/auth-page-layout";
import { alertService } from "@/shared/services/alert.service";
import { ResetPassForm } from "../components/reset-password-form";

export default function ResetPassPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const { correo } = location.state as { correo: string };

  const methods = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { nuevoPassword: "", confirmarPassword: "" },
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: ResetPasswordForm) =>
      authService.resetPassword({
        correo,
        nuevoPassword: data.nuevoPassword,
        confirmarPassword: data.confirmarPassword,
      }),
    onSuccess: (_) => {
      alertService.success(
        "Tu contraseña se ha restablecido correctamente. Inicia sesión con tus nuevas credenciales.",
        "Cambio Exitoso",
        undefined,
        () => navigate("/login")
      );
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
          <ResetPassForm
            isPending={isPending}
            correo={correo}
          />
        </form>
      </FormProvider>
    </AuthPageLayout>
  );
}
