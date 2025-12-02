import PortalCredentialsForm from "./portal-credentials-form";
import { Button } from "@/components/ui/button";
import Image from "next/image";

const StaffSignInForm = () => {
  return (
    <PortalCredentialsForm
      idPrefix="staff"
      submitLabel="Sign In as Staff"
      placeholderEmail="staff@example.com"
      role="staff"
    >
      <div className="space-y-3 border-t border-border pt-4">
        <Button type="button" variant="outline" className="w-full">
          <Image src="/images/microsoft.svg" alt="Microsoft" width={20} height={20} /> Sign in with Microsoft (MSAL)
        </Button>
      </div>
    </PortalCredentialsForm>
  );
};

export default StaffSignInForm;
