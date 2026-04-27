import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";

const getEnvKeys = createServerFn().handler(async () => {
  return {
    globalDB: !!(globalThis as any).DB,
    processEnv: !!process.env.DB,
    allGlobalKeys: Object.keys(globalThis).filter(k => k.length < 50),
  };
});

export const Route = createFileRoute("/debug")({
  loader: async () => await getEnvKeys(),
  component: () => {
    const data = Route.useLoaderData();
    return (
      <div className="p-10 font-mono">
        <h1>Debug Info</h1>
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </div>
    );
  }
});
