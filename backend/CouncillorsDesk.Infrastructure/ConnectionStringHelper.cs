using Microsoft.Extensions.Configuration;
using Npgsql;

namespace CouncillorsDesk.Infrastructure;

/// <summary>
/// Normalizes Postgres connection strings from Neon/Heroku URI format to Npgsql key-value format.
/// </summary>
public static class ConnectionStringHelper
{
    private const string ConfigKey = "ConnectionStrings:DefaultConnection";

    public static void EnsureDefaultConnection(IConfigurationManager configuration)
    {
        var raw = configuration[ConfigKey]
            ?? Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection")
            ?? Environment.GetEnvironmentVariable("DATABASE_URL");

        if (string.IsNullOrWhiteSpace(raw))
        {
            return;
        }

        raw = raw.Trim();

        if (raw.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase)
            || raw.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase))
        {
            // Some hosts truncate env values at '=' inside ?sslmode=require
            if (raw.EndsWith("?sslmode", StringComparison.OrdinalIgnoreCase))
            {
                raw += "=require";
            }

            var builder = new NpgsqlConnectionStringBuilder(raw);
            configuration[ConfigKey] = builder.ConnectionString;
            return;
        }

        configuration[ConfigKey] = raw;
    }
}
