import NewApplicationForm from "@/components/forms/application-forms/new-application-form";

const NewApplicationPage = () => {
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-foreground">
          New Application
        </h1>
        <p className="text-muted-foreground">
          Complete each step to submit a new student application.
        </p>
      </div>

      <NewApplicationForm />
    </section>
  );
};

export default NewApplicationPage;
