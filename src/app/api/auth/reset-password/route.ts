import { ok, route } from "@/lib/api/responses";
import { resetPassword } from "@/services/auth.service";
import { resetPasswordSchema } from "@/validators/auth";

export function POST(request: Request) {
  return route(async () => {
    const input = resetPasswordSchema.parse(await request.json());
    return ok(await resetPassword(input));
  });
}
