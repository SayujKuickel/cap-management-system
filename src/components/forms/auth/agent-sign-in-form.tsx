import PortalCredentialsForm from "./portal-credentials-form";

const AgentSignInForm = () => {
  return (
    <PortalCredentialsForm
      idPrefix="agent"
      submitLabel="Sign In as Agent"
      placeholderEmail="agent@example.com"
      role="agent"
    />
  );
};

export default AgentSignInForm;
