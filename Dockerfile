# ===== Build React Frontend =====
FROM node:20 AS build-frontend
WORKDIR /app
COPY Front_End/package*.json ./
RUN npm install
COPY Front_End/ ./
RUN npm run build

# ===== Build .NET Backend =====
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build-backend
WORKDIR /src
COPY MobilizaAPI.csproj ./
RUN dotnet restore MobilizaAPI.csproj
COPY . ./
RUN dotnet publish MobilizaAPI.csproj -c Release -o /app

# ===== Runtime =====
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

# Copiar backend publicado
COPY --from=build-backend /app ./

# Copiar frontend build para wwwroot
COPY --from=build-frontend /app/dist ./wwwroot

# Porta exposta
ENV ASPNETCORE_URLS=http://+:${PORT}
EXPOSE 5000

# Iniciar aplicação
ENTRYPOINT ["dotnet", "MobilizaAPI.dll"]
