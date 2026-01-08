using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace ERP.API.Attributes;

[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
public class AdminApiKeyAttribute : Attribute, IAsyncActionFilter
{
    private const string APIKEYNAME = "X-Admin-Key";
    private const string APIKEY = "1488"; // Заміни на свій

    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        if (!context.HttpContext.Request.Headers.TryGetValue(APIKEYNAME, out var extractedApiKey))
        {
            context.Result = new ContentResult() { StatusCode = 401, Content = "Ключ доступу відсутній" };
            return;
        }

        if (!APIKEY.Equals(extractedApiKey))
        {
            context.Result = new ContentResult() { StatusCode = 403, Content = "Невірний ключ доступу" };
            return;
        }

        await next();
    }
}