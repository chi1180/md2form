import Editor from "#/components/editor";
import Form from "#/components/form";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Image } from "@unpic/react";

export const Route = createFileRoute("/playground/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <header className="w-full h-16 py-2 px-4 bg-bg-secondary flex items-center">
        <Link to="/app/dashboard">
          <Image src="/public/logo.png" width={40} height={40} />
        </Link>
      </header>

      <main className="w-full h-[calc(100vh-4rem)] p-2 bg-white flex gap-2 *:w-full *:h-full">
        <Editor />
        <Form />
      </main>
    </>
  );
}
