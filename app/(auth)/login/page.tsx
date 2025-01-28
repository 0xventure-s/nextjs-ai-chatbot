"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";

import { AuthForm } from "@/components/auth-form";
import { SubmitButton } from "@/components/submit-button";

import { login, type LoginActionState } from "../actions";
import Image from "next/image";

export default function Page() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [isSuccessful, setIsSuccessful] = useState(false);

  const [state, formAction] = useActionState<LoginActionState, FormData>(
    login,
    {
      status: "idle",
    }
  );

  useEffect(() => {
    if (state.status === "failed") {
      toast.error("¡Credenciales inválidas!");
    } else if (state.status === "invalid_data") {
      toast.error("¡Error al validar tu envío!");
    } else if (state.status === "success") {
      setIsSuccessful(true);
      router.refresh();
    }
  }, [state.status, router]);

  const handleSubmit = (formData: FormData) => {
    setEmail(formData.get("email") as string);
    formAction(formData);
  };

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background p-4 md:p-0 ">
      <div className="w-full max-w-md overflow-hidden rounded-2xl flex flex-col gap-8 ">
        <div className="flex flex-col items-center justify-center gap-4 px-4  text-center sm:px-16">
          <Image
            src="/images/metrics.png"
            width={500}
            height={500}
            alt="Logo"
          />
          <div className="flex justify-center gap-2 px-4 "></div>
          <h3 className="text-xl font-semibold dark:text-zinc-50">
            Iniciar Sesión
          </h3>
          <p className="text-sm text-gray-500 dark:text-zinc-400">
            Usa tu correo electrónico y contraseña para iniciar sesión
          </p>
        </div>
        <AuthForm action={handleSubmit} defaultEmail={email}>
          <SubmitButton isSuccessful={isSuccessful}>
            Iniciar sesión
          </SubmitButton>
          <p className="text-center text-sm text-gray-600 mt-4 dark:text-zinc-400">
            {"¿No tienes una cuenta? "}
            <Link
              href="/register"
              className="font-semibold text-gray-800 hover:underline dark:text-zinc-200"
            >
              Regístrate
            </Link>
            {" gratis."}
          </p>
        </AuthForm>
      </div>
    </div>
  );
}
