import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold text-center">
        Welcome to TanStack Start
      </h1>
      <p className="mt-4 text-center">
        <Link to="/playground" className="font-bold">
          Here
        </Link>{" "}
        is where you can play with the form generator.
      </p>
    </div>
  );
}
