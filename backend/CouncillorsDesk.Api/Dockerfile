# Multi-stage build for Render deployment
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY CouncillorsDesk.Core/CouncillorsDesk.Core.csproj CouncillorsDesk.Core/
COPY CouncillorsDesk.Infrastructure/CouncillorsDesk.Infrastructure.csproj CouncillorsDesk.Infrastructure/
COPY CouncillorsDesk.Api/CouncillorsDesk.Api.csproj CouncillorsDesk.Api/

RUN dotnet restore CouncillorsDesk.Api/CouncillorsDesk.Api.csproj

COPY CouncillorsDesk.Core/ CouncillorsDesk.Core/
COPY CouncillorsDesk.Infrastructure/ CouncillorsDesk.Infrastructure/
COPY CouncillorsDesk.Api/ CouncillorsDesk.Api/

RUN dotnet publish CouncillorsDesk.Api/CouncillorsDesk.Api.csproj -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

ENV ASPNETCORE_ENVIRONMENT=Production
ENV ASPNETCORE_URLS=http://0.0.0.0:8080

RUN mkdir -p /app/uploads

COPY --from=build /app/publish .

EXPOSE 8080

CMD ["dotnet", "CouncillorsDesk.Api.dll"]
