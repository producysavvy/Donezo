import { ok, route } from "@/lib/api/responses";
import { requestPasswordReset } from "@/services/auth.service";
import { forgotPasswordSchema } from "@/validators/auth";

export function POST(request: Request) {
  return route(async () => {
    const input = forgotPasswordSchema.parse(await request.json());
    return ok(await requestPasswordReset(input));
  });
}
