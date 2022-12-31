import Route from "@ioc:Adonis/Core/Route";
import HealthCheck from "@ioc:Adonis/Core/HealthCheck";

Route.get("/", async () => {
    return { hello: "world yo" };
});

Route.get("/health", async ({ response }) => {
    const report = await HealthCheck.getReport();

    return report.healthy ? response.ok(report) : response.badRequest(report);
});

Route.group(() => {
    //authentications
    Route.post("register", "AuthController.register").as("register");
    Route.post("login", "AuthController.login").as("login");
    Route.post("logout", "AuthController.logout").as("logout");
    Route.get("/verify-email/:email", "AuthController.confirm").as(
        "verifyEmail"
    );
})
    .namespace("App/Controllers/Http/Users")
    .prefix("api/v1/users");
