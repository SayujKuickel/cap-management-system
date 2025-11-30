import { z } from "zod";

export type DocumentType = {
  id: string;
  title: string;
  required: boolean;
  files: File[];
};

export const documentSchema = z.object({
  id: z.string(),
  title: z.string(),
  required: z.boolean(),
  files: z.array(z.instanceof(File)),
});

export const documentsSchema = z.object({
  documents: z.array(documentSchema),
});

export type DocumentsFormValues = z.infer<typeof documentsSchema>;

export const defaultDocuments: DocumentType[] = [
  { id: "passport", title: "Applicant's Passport", required: true, files: [] },
  {
    id: "english-test",
    title: "Evidence Of English Test",
    required: true,
    files: [],
  },
  { id: "academic", title: "Academic Document", required: true, files: [] },
  {
    id: "work-experience",
    title: "Work Experience / Gap Evidence",
    required: false,
    files: [],
  },
  {
    id: "application-form",
    title: "Application Form Completed and Signed",
    required: true,
    files: [],
  },
  {
    id: "other-supporting",
    title: "Other Supporting Document",
    required: false,
    files: [],
  },
  {
    id: "applicants-academic",
    title: "Applicants Academic",
    required: false,
    files: [],
  },
];
