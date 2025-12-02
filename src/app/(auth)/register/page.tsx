import RegisterForm from "@/components/forms/auth/register-form"
import Image from "next/image";
const RegisterPage = () => {
  return (
    <main className="flex min-h-screen items-center justify-center  ">
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-2 text-center">
        <div className="relative    w-52 mx-auto flex items-center justify-center">
              <Image
                src="/images/logo.svg"
                alt="Churchill Institute of Higher Education"
                width={48}
                height={48}
                className="object-contain w-full h-full"
                priority
              />
            </div>
          <p className="text-sm text-muted-foreground">
            Application Management System
          </p>
        </div>

        <RegisterForm />

        <p className="text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Churchill Institute of Higher Education. All rights
          reserved.
        </p>
      </div>
    </main>
  );
};

export default RegisterPage;
