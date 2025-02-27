using Lumen.Modules.Youtube.Business;

namespace Lumen.Modules.Youtube.ConsoleApp {
    internal class Program {
        static async Task Main(string[] args) {
            Console.WriteLine($"{DateTime.Now} - Querying youtube stats ...");

            var (amount, duration) = await YoutubeAPIHelper.ComputeWatchlistStatus("AIzaSyDC-8bAQG5owpOBFAEWxnkXYX3D1Rw5yss", "PLvMjwrZuqkZhfX_BW3LBI_4UgZHnwAzjk");

            var timespan = TimeSpan.FromSeconds(duration);
            Console.WriteLine($"{DateTime.Now} - Stats: {amount} videos, {(int)timespan.TotalHours}:{timespan:mm\\:ss}");
        }
    }
}
