import { DateTime } from "luxon";
import Hash from "@ioc:Adonis/Core/Hash";
import { column, beforeSave, BaseModel } from "@ioc:Adonis/Lucid/Orm";
import Mail from "@ioc:Adonis/Addons/Mail";
import Env from "@ioc:Adonis/Core/Env";
import Route from "@ioc:Adonis/Core/Route";

export default class User extends BaseModel {
    @column({ isPrimary: true })
    public id: number;

    @column()
    public email: string;

    @column({ serializeAs: null })
    public password: string;

    @column()
    public isActivated: boolean = false;

    @column.dateTime()
    public emailVerifiedAt: DateTime;

    @column()
    public rememberMeToken: string | null;

    @column.dateTime({ autoCreate: true })
    public createdAt: DateTime;

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    public updatedAt: DateTime;

    @beforeSave()
    public static async hashPassword(user: User) {
        if (user.$dirty.password) {
            user.password = await Hash.make(user.password);
        }
    }

    public async sendActivationEmail() {
        const appDomain = Env.get("APP_URL");
        const appName = Env.get("APP_NAME");
        const currentYear = new Date().getFullYear();

        const url = Route.builder()
            .params({ email: this.email })
            .prefixUrl(appDomain)
            .makeSigned("verifyEmail", { expiresIn: "24 hours" });
        await Mail.send((message) => {
            message
                .from(Env.get("DEFAULT_FROM_EMAIL"))
                .to(this.email)
                .subject(`Activate your ${appName} account`)
                .htmlView("emails/auth/verify", {
                    user: this,
                    url,
                    appName,
                    appDomain,
                    currentYear,
                });
        });
    }
}
