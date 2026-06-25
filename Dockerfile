# Render: leave Root Directory BLANK, Dockerfile Path = Dockerfile
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY backend/CouncillorsDesk.Core/CouncillorsDesk.Core.csproj backend/CouncillorsDesk.Core/
COPY backend/CouncillorsDesk.Infrastructure/CouncillorsDesk.Infrastructure.csproj backend/CouncillorsDesk.Infrastructure/
COPY backend/CouncillorsDesk.Api/CouncillorsDesk.Api.csproj backend/CouncillorsDesk.Api/

RUN dotnet restore backend/CouncillorsDesk.Api/CouncillorsDesk.Api.csproj

COPY backend/CouncillorsDesk.Core/ backend/CouncillorsDesk.Core/
COPY backend/CouncillorsDesk.Infrastructure/ backend/CouncillorsDesk.Infrastructure/
COPY backend/CouncillorsDesk.Api/ backend/CouncillorsDesk.Api/

RUN dotnet publish backend/CouncillorsDesk.Api/CouncillorsDesk.Api.csproj -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

ENV ASPNETCORE_ENVIRONMENT=Production
ENV ASPNETCORE_URLS=http://0.0.0.0:8080

RUN mkdir -p /app/uploads

COPY --from=build /app/publish .

EXPOSE 8080

CMD ["dotnet", "CouncillorsDesk.Api.dll"]
