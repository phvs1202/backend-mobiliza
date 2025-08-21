using Microsoft.EntityFrameworkCore;
using MobilizaAPI.Repository;
using Microsoft.Extensions.Logging;
using Pomelo.EntityFrameworkCore.MySql.Infrastructure;

var builder = WebApplication.CreateBuilder(new WebApplicationOptions
{
    ContentRootPath = Directory.GetCurrentDirectory(),
    WebRootPath = "wwwroot"
});


// Logging
builder.Logging.ClearProviders();
builder.Logging.AddConsole();

// CORS - permite frontend de produção e localhost
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy
            .WithOrigins(
                "https://mobiliza-gersite.onrender.com",
                "https://mobilizasenailp-3hyec7d9d-iagoprogramers-projects.vercel.app",
                "https://mobilizasenailp.vercel.app",// produção
                "http://localhost:3000",                 // frontend local
                "https://localhost:3000",
                 "http://localhost:5173"  , 
                 "http://localhost:5174"        // frontend local https
            )
            .AllowAnyMethod()
            .AllowAnyHeader();
    });
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Get connection string
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
if (string.IsNullOrWhiteSpace(connectionString))
{
    throw new InvalidOperationException("Connection string 'DefaultConnection' não está configurada. Verifique as Environment Variables no Render ou no appsettings.json.");
}

// Define versão fixa do MySQL
var serverVersion = new MySqlServerVersion(new Version(8, 0, 33));

// Configuração do DbContext
builder.Services.AddDbContext<DBMobilizaContext>(options =>
{
    options.UseMySql(connectionString, serverVersion, mySqlOptions =>
    {
        mySqlOptions.EnableRetryOnFailure(
            maxRetryCount: 5,
            maxRetryDelay: TimeSpan.FromSeconds(10),
            errorNumbersToAdd: null
        );
    });
}, ServiceLifetime.Scoped);

var app = builder.Build();

// Middleware
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}

app.UseSwagger();
app.UseSwaggerUI();

app.UseStaticFiles(); // Serve os arquivos do React

app.UseRouting();

app.UseCors();

app.UseHttpsRedirection();
app.UseAuthorization();

app.MapControllers();

// Fallback para SPA: qualquer rota não-API serve index.html do React
app.MapFallbackToFile("index.html");

app.Run();
