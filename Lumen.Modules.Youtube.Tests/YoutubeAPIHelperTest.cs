using Lumen.Modules.Youtube.Business;

using Microsoft.Extensions.Configuration;

namespace Lumen.Modules.Youtube.Tests {
    public class YoutubeAPIHelperTest {
        private string API_KEY;
        private string PLAYLIST_ID;

        public YoutubeAPIHelperTest() {
            IConfigurationRoot config = new ConfigurationBuilder()
                .AddUserSecrets<YoutubeAPIHelperTest>()
                .Build();

            API_KEY = config["API_KEY"];
            PLAYLIST_ID = config["PLAYLIST_ID"];
        }

        [Fact]
        public async Task ComputeWatchlistStatus_Ok() {
            var (amount, totalDuration) = await YoutubeAPIHelper.ComputeWatchlistStatus(API_KEY, PLAYLIST_ID);

            Assert.True(amount > 0);
            Assert.True(totalDuration > 0);
        }
    }
}
