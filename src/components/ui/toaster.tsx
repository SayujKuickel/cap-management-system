"use client";

import { useSession } from "next-auth/react";
import { Toaster } from "react-hot-toast";

const AppToaster = () => {
  const session = useSession();
  console.log(session);

  return <Toaster position="bottom-right" toastOptions={{ duration: 2000 }} />;
};

export default AppToaster;
