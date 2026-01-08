# Етап збірки (SDK)
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# 1. Копіюємо файл рішення та проекти
COPY ["ERP-System.slnx", "./"]
COPY ["ERP.Domain/ERP.Domain.csproj", "ERP.Domain/"]
COPY ["ERP.Data/ERP.Data.csproj", "ERP.Data/"]
COPY ["ERP.API/ERP.API.csproj", "ERP.API/"]

# 2. Відновлюємо залежності для всього рішення
RUN dotnet restore

# 3. Копіюємо весь інший код
COPY . .

# 4. Збираємо та публікуємо саме API проект
WORKDIR "/src/ERP.API"
RUN dotnet publish -c Release -o /app/publish

# Етап запуску (Runtime)
# Використовуємо aspnet, бо це веб-сервер, а не просто консоль
FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app
COPY --from=build /app/publish .

# Запускаємо головний проект
ENTRYPOINT ["dotnet", "ERP.API.dll"]