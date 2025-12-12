"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { AlertCircle, ArrowLeft, Home, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const errorMessages: Record<string, { title: string; description: string }> = {
    Configuration: {
        title: "Configuration Error",
        description: "There is a problem with the server configuration. Please contact support.",
    },
    AccessDenied: {
        title: "Access Denied",
        description: "You do not have permission to access this resource.",
    },
    Verification: {
        title: "Verification Failed",
        description: "The verification token has expired or has already been used.",
    },
    Default: {
        title: "Authentication Error",
        description: "An error occurred during authentication. Please try again.",
    },
    CredentialsSignin: {
        title: "Invalid Credentials",
        description: "The email or password you entered is incorrect. Please try again.",
    },
    SessionRequired: {
        title: "Session Required",
        description: "You must be signed in to access this page.",
    },
};

function ErrorContent() {
    const searchParams = useSearchParams();
    const error = searchParams.get("error") || "Default";

    const errorInfo = errorMessages[error] || errorMessages.Default;

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                        <AlertCircle className="h-8 w-8 text-destructive" />
                    </div>
                    <CardTitle className="text-2xl">{errorInfo.title}</CardTitle>
                    <CardDescription className="text-base">
                        {errorInfo.description}
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                    {error !== "Default" && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Error Code</AlertTitle>
                            <AlertDescription className="font-mono text-sm">
                                {error}
                            </AlertDescription>
                        </Alert>
                    )}

                    <div className="flex flex-col gap-2">
                        <Button asChild className="w-full">
                            <Link href="/login">
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Try Again
                            </Link>
                        </Button>

                        <Button asChild variant="outline" className="w-full">
                            <Link href="/">
                                <Home className="mr-2 h-4 w-4" />
                                Go to Home
                            </Link>
                        </Button>

                        <Button asChild variant="ghost" className="w-full">
                            <Link href="/login">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Login
                            </Link>
                        </Button>
                    </div>

                    <div className="rounded-lg bg-muted p-4 text-center text-sm text-muted-foreground">
                        <p>
                            If this problem persists, please contact{" "}
                            <a
                                href="mailto:support@example.com"
                                className="font-medium text-primary underline-offset-4 hover:underline"
                            >
                                support@example.com
                            </a>
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default function AuthErrorPage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted p-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                            <AlertCircle className="h-8 w-8 text-destructive animate-pulse" />
                        </div>
                        <CardTitle className="text-2xl">Loading...</CardTitle>
                    </CardHeader>
                </Card>
            </div>
        }>
            <ErrorContent />
        </Suspense>
    );
}
