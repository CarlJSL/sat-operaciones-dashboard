import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { loginContextSchema, type LoginContext } from "@/domain/auth";
import { RolCodigo, type RolCodigoType } from "@/domain/roles";
import loginImage from "@/assets/images/login-img.jpg";
import logo from "@/assets/logos/logo.png";
import { authService } from "@/features/auth/api/auth.service";
import { useAuthStore } from "@/features/auth/store/authStore";
import { LoginForm } from "@/features/auth/components/login-form";

const ROLE_REDIRECTS: Partial<Record<RolCodigoType, string>> = {
  [RolCodigo.ADMIN]: "/usuarios",
  [RolCodigo.CLIENTE]: "/mis-operaciones",
  [RolCodigo.VENDEDOR]: "/operaciones/por-verificar",
};

function getDefaultRoute(role: RolCodigoType): string {
  return ROLE_REDIRECTS[role] ?? "/";
}

export default function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const methods = useForm<LoginContext>({
    resolver: zodResolver(loginContextSchema),
    defaultValues: { correo: "", password: "" },
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  const { mutate, isPending } = useMutation({
    mutationFn: authService.login,
    onSuccess: ({ user, token }) => {
      setAuth(user, token);
      navigate(getDefaultRoute(user.role), { replace: true });
    },
  });

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <img src={logo} alt="Logo" className="h-6 w-6 object-contain" />
          <span className="text-sm font-medium">Sat</span>
        </div>

        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <FormProvider {...methods}>
              <LoginForm
                isPending={isPending}
                onSubmit={methods.handleSubmit((data) => mutate(data))}
                noValidate
              />
            </FormProvider>
          </div>
        </div>
      </div>

      <div className="relative hidden bg-muted lg:block">
        <img
          src={loginImage}
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
}
