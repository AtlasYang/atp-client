import { APP_NAME } from "../common/constants";
import { BaseLayout } from "../components/base-layout";
import { Card } from "../components/ui/card";
import { AlertTriangle } from "lucide-react";
import { Button } from "../components/ui/button";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <BaseLayout
      breadcrumbs={[
        {
          text: APP_NAME,
          href: "/",
        },
        {
          text: "Not Found",
          href: "/not-found",
        },
      ]}
    >
      <div className="flex flex-col items-center justify-center min-h-[70vh] py-12">
        <Card className="w-full max-w-md p-8 shadow-2xl flex flex-col items-center gap-4 border-destructive border">
          <AlertTriangle className="text-destructive w-10 h-10 mb-2" />
          <h1 className="text-3xl font-bold text-destructive">
            404. Page Not Found
          </h1>
          <p className="text-muted-foreground text-center">
            The page you are looking for does not exist.
          </p>
          <Button variant="default" className="mt-4">
            <Link to="/">Go Home</Link>
          </Button>
        </Card>
      </div>
    </BaseLayout>
  );
}
