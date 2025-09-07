import { NextRequest, NextResponse } from 'next/server';

/**
 * Compose multiple middlewares into a single handler
 */
export function composeMiddleware(
  ...middlewares: Array<
    (handler: (_req: NextRequest) => Promise<NextResponse>) => 
    (_req: NextRequest) => Promise<NextResponse>
  >
) {
  return (handler: (_req: NextRequest) => Promise<NextResponse>) => {
    return middlewares.reduceRight(
      (acc, middleware) => middleware(acc),
      handler
    );
  };
}

/**
 * Utility to make middleware composition more readable
 */
export class MiddlewareComposer {
  private middlewares: Array<
    (handler: (_req: NextRequest) => Promise<NextResponse>) => 
    (_req: NextRequest) => Promise<NextResponse>
  > = [];

  use(
    middleware: (handler: (_req: NextRequest) => Promise<NextResponse>) => 
    (_req: NextRequest) => Promise<NextResponse>
  ) {
    this.middlewares.push(middleware);
    return this;
  }

  compose(handler: (_req: NextRequest) => Promise<NextResponse>) {
    return this.middlewares.reduceRight(
      (acc, middleware) => middleware(acc),
      handler
    );
  }
}

/**
 * Example usage:
 * 
 * const handler = new MiddlewareComposer()
 *   .use(apiRateLimit)
 *   .use(requireAuth)
 *   .use(withBodyValidation(mySchema))
 *   .compose(async (req: any) => {
 *     // Your API logic here
 *     return NextResponse.json({ success: true });
 *   });
 */