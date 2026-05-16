import { created, route } from "@/lib/api/responses";
import { signup } from "@/services/auth.service";
import { signupSchema } from "@/validators/auth";

export function POST(request: Request) {
  return route(async () => {
    const input = signupSchema.parse(await request.json());
    return created(await signup(input));
  });
}
