import z from "zod";

export const forgotPasswordForm = z.object({
  correo: z.email("Correo Inválido"),
});

export type ForgotPasswordForm = z.infer<typeof forgotPasswordForm>;

export const verifyCodeSchema = z.object({
  code: z.string().length(6, "El código debe tener 6 dígitos"),
});

export type VerifyCodeFormulario = z.infer<typeof verifyCodeSchema>;

export const resetPasswordSchema = z
  .object({
    nuevoPassword: z
      .string()
      .min(8, "Mínimo 8 caracteres")
      .regex(/[A-Z]/, "Debe contener al menos una mayúscula")
      .regex(/[a-z]/, "Debe contener al menos una minúscula")
      .regex(/[0-9]/, "Debe contener al menos un número")
      .regex(
        /[^A-Za-z0-9]/,
        "Debe contener al menos un carácter especial (@, #, $, etc.)",
      ),
    confirmarPassword: z.string(),
  })
  .refine((d) => d.nuevoPassword === d.confirmarPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmarPassword"],
  });

export type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;
