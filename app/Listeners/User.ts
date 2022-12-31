import Mail from "@ioc:Adonis/Addons/Mail";
import type { EventsList } from "@ioc:Adonis/Core/Event";
import Env from "@ioc:Adonis/Core/Env";
import Route from "@ioc:Adonis/Core/Route";

export default class User {
    public async onNewUser({ newUser }: EventsList["new:user"]) {
        const appDomain = Env.get("APP_URL");
        const appName = Env.get("APP_NAME");
        const defaultFromEmail = Env.get("DEFAULT_FROM_EMAIL");
        const currentYear = new Date().getFullYear();
        console.log("Email Verifiation Sended");
        const url = Route.builder()
            .params({ email: newUser.email })
            .prefixUrl(appDomain)
            .makeSigned("verifyEmail", { expiresIn: "24hours" });
        await Mail.send((message) => {
            message
                .from(defaultFromEmail)
                .to(newUser.email)
                .subject(`Activate your ${appName} account`)
                .htmlView("emails/auth/verify", {
                    user: newUser,
                    url,
                    appName,
                    appDomain,
                    currentYear,
                });
        });
    }
}
