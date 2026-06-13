import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { forgotPasswordForm, type ForgotPasswordForm } from "@/domain/auth";
import { authService } from "@/features/auth/api/auth.service";
import { AuthPageLayout } from "@/features/auth/components/auth-page-layout";
import { ForgotPassForm } from "@/features/auth/components/forgot-password-form";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();

  const methods = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordForm),
    defaultValues: { correo: "" },
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: ForgotPasswordForm) =>
      authService.forgotPasword(data.correo),
    onSuccess: (_, variables) => {
      navigate("/verify-code", { state: { correo: variables.correo } });
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
          <ForgotPassForm isPending={isPending} />
        </form>
      </FormProvider>
    </AuthPageLayout>
  );
}
