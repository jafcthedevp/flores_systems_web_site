// Superficie de Deno usada por estas funciones, para comprobar también los SDK
// con TypeScript en Windows sin instalar un segundo runtime de desarrollo.
declare const Deno: {
  env: { get(name: string): string | undefined };
  serve(handler: (request: Request) => Response | Promise<Response>): unknown;
};
