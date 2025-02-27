using Lumen.Modules.Sdk;
using Lumen.Modules.Youtube.Business;
using Lumen.Modules.Youtube.Common.Models;
using Lumen.Modules.Youtube.Data;

using Microsoft.EntityFrameworkCore;

namespace Lumen.Modules.Youtube.Module {
    public class YoutubeModule(LumenModuleRunsOnFlag runsOn, IEnumerable<ConfigEntry> configEntries, ILogger<LumenModuleBase> logger, IServiceProvider provider) : LumenModuleBase(runsOn, configEntries, logger) {
        public const string PLAYLIST_ID = nameof(PLAYLIST_ID);
        public const string API_KEY = nameof(API_KEY);

        public override Task InitAsync(LumenModuleRunsOnFlag currentEnv) {
            // Nothing to do
            return Task.CompletedTask;
        }

        public override async Task RunAsync(LumenModuleRunsOnFlag currentEnv) {
            var (amount, duration) = await YoutubeAPIHelper.ComputeWatchlistStatus(GetAPIKey(), GetPlaylistId());

            var timespan = TimeSpan.FromSeconds(duration);
            Console.WriteLine($"{DateTime.Now} - Stats: {amount} videos, {(int)timespan.TotalHours}:{timespan:mm\\:ss}");

            switch (currentEnv) {
                case LumenModuleRunsOnFlag.API:
                    await RunAPIAsync(amount, duration);
                    break;
                case LumenModuleRunsOnFlag.UI:
                    await RunUIAsync(amount, duration);
                    break;
            }
        }

        private string GetPlaylistId() {
            var configEntry = configEntries.FirstOrDefault(x => x.ConfigKey == PLAYLIST_ID);
            if (configEntry is null || configEntry.ConfigValue is null) {
                logger.LogError($"[{nameof(YoutubeModule)}] Config key \"{PLAYLIST_ID}\" is missing!");
            }

            return configEntry.ConfigValue;
        }

        private string GetAPIKey() {
            var configEntry = configEntries.FirstOrDefault(x => x.ConfigKey == API_KEY);
            if (configEntry is null || configEntry.ConfigValue is null) {
                logger.LogError($"[{nameof(YoutubeModule)}] Config key \"{API_KEY}\" is missing!");
            }

            return configEntry.ConfigValue;
        }

        public async Task RunUIAsync(int amount, int duration) {
            // TODO
        }

        public async Task RunAPIAsync(int amount, int duration) {
            using var scope = provider.CreateScope();
            var context = provider.GetRequiredService<YoutubeContext>();

            context.YoutubeWatchlist.Add(new YoutubeWatchlistPointInTime {
                Time = DateTime.UtcNow,
                AmountVideos = amount,
                SecondsDuration = duration
            });
            await context.SaveChangesAsync();
        }

        public override bool ShouldRunNow(LumenModuleRunsOnFlag currentEnv) {
            return currentEnv switch {
                LumenModuleRunsOnFlag.UI => DateTime.UtcNow.Second == 0 && DateTime.UtcNow.Minute == 27,
                LumenModuleRunsOnFlag.API => true, // DateTime.UtcNow.Second == 0 && DateTime.UtcNow.Minute % 5 == 0,
                _ => false,
            };
        }

        public override Task ShutdownAsync() {
            // Nothing to do
            return Task.CompletedTask;
        }

        public static new void SetupServices(LumenModuleRunsOnFlag currentEnv, IServiceCollection serviceCollection, string? postgresConnectionString) {
            if (currentEnv == LumenModuleRunsOnFlag.API) {
                serviceCollection.AddDbContext<YoutubeContext>(o => o.UseNpgsql(postgresConnectionString, x => x.MigrationsHistoryTable("__EFMigrationsHistory", YoutubeContext.SCHEMA_NAME)));
            }
        }

        public override Type GetDatabaseContextType() {
            return typeof(YoutubeContext);
        }
    }
}
