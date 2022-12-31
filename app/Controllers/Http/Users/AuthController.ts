import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import User from "App/Models/User";
import { schema, rules } from "@ioc:Adonis/Core/Validator";
import { DateTime } from "luxon";

export default class AuthController {
    public async register({ request, response }: HttpContextContract) {
        //register user validation
        const validation = await schema.create({
            email: schema.string({}, [
                rules.email(),
                rules.unique({ table: "users", column: "email" }),
            ]),
            password: schema.string({}, [
                rules.confirmed("passwordConfirmation"),
            ]),
        });

        const data = await request.validate({ schema: validation });
        const user = await User.create(data);

        user?.sendActivationEmail();

        return response.status(201).send({
            success:
                "Registration successful, check your email inbox for a verification email",
        });
    }

    public async login({ request, response, auth }: HttpContextContract) {
        const { email, password } = await request.body();

        try {
            const token = await auth.use("api").attempt(email, password, {
                expiresIn: "24hours",
            });
            return response.ok(token.toJSON());
        } catch (error) {
            return response.badRequest(error);
        }
    }

    public async logout({ auth, response }: HttpContextContract) {
        await auth.logout();
        return response.ok({ message: "Logout successfully" });
    }

    public async confirm({ request, response, params }: HttpContextContract) {
        if (request.hasValidSignature()) {
            const user = await User.findByOrFail("email", params.email);
            if (!user.isActivated) {
                user.emailVerifiedAt = DateTime.local();
                user.isActivated = true;
                user.save();
                return response
                    .status(202)
                    .send({ message: "account activated and email verified" });
            } else {
                return response
                    .status(409)
                    .send({ message: "email already verified" });
            }
        } else {
            return response.status(403).send({ error: "invalid signature" });
        }
    }
}
