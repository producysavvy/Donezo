import { ok, route } from "@/lib/api/responses";
import { login } from "@/services/auth.service";
import { loginSchema } from "@/validators/auth";

export function POST(request: Request) {
  return route(async () => {
    const input = loginSchema.parse(await request.json());
    return ok(await login(input));
  });
}
