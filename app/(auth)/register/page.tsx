"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";

import { AuthForm } from "@/components/auth-form";
import { SubmitButton } from "@/components/submit-button";

import { register, type RegisterActionState } from "../actions";
import Image from "next/image";

export default function Page() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [isSuccessful, setIsSuccessful] = useState(false);

  const [state, formAction] = useActionState<RegisterActionState, FormData>(
    register,
    {
      status: "idle",
    }
  );

  useEffect(() => {
    if (state.status === "user_exists") {
      toast.error("La cuenta ya existe");
    } else if (state.status === "failed") {
      toast.error("Error al crear la cuenta");
    } else if (state.status === "invalid_data") {
      toast.error("Error al validar tu envío!");
    } else if (state.status === "success") {
      toast.success("Cuenta creada con éxito");
      setIsSuccessful(true);
      router.refresh();
    }
  }, [state, router]);

  const handleSubmit = (formData: FormData) => {
    setEmail(formData.get("email") as string);
    formAction(formData);
  };

  return (
    <div className="flex h-dvh w-screen items-start pt-12 md:pt-0 md:items-center justify-center bg-background">
      <div className="w-full max-w-md overflow-hidden rounded-2xl gap-12 flex flex-col">
        <div className="flex justify-center gap-2 px-4">
          <Image src="/vision.png" width={20} height={20} alt="Logo" />
          <h3 className="text-xl font-semibold dark:text-zinc-50">
            VISION METRIC AI.
          </h3>
        </div> <h3 className="text-xl font-semibold dark:text-zinc-50 text-center">Crear Cuenta</h3>
        <div className="flex flex-col items-center justify-center gap-2 px-4 text-center sm:px-16">
          <p className="text-sm text-gray-500 dark:text-zinc-400">
            Crea una cuenta con tu correo electrónico y contraseña
          </p>
        </div>
        <AuthForm action={handleSubmit} defaultEmail={email}>
          <SubmitButton isSuccessful={isSuccessful}>Regístrate</SubmitButton>
          <p className="text-center text-sm text-gray-600 mt-4 dark:text-zinc-400">
            {"¿Ya tienes una cuenta? "}
            <Link
              href="/login"
              className="font-semibold text-gray-800 hover:underline dark:text-zinc-200"
            >
              Inicia sesión
            </Link>
            {" en su lugar."}
          </p>
        </AuthForm>
      </div>
    </div>
  );
}
