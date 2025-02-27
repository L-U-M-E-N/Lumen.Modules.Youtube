using Google.Apis.Services;
using Google.Apis.YouTube.v3;
using Google.Apis.YouTube.v3.Data;

using System.Xml;

namespace Lumen.Modules.Youtube.Business {
    public static class YoutubeAPIHelper {
        public static async Task<(int, int)> ComputeWatchlistStatus(string apiKey, string playListId) {
            var service = new Google.Apis.YouTube.v3.YouTubeService(new BaseClientService.Initializer {
                ApplicationName = "Lumen.Modules.Youtube",
                ApiKey = apiKey,
            });

            var totalDuration = 0;
            var amount = 0;
            string? nextPageToken = null;
            PlaylistItemListResponse response;
            do {
                response = await GetPlaylistPageItemsAsync(service, playListId, nextPageToken);

                amount += response.Items.Count;
                totalDuration += (await GetVideosAccumulatedDurationAsync(service, response.Items.Select(x => x.Snippet.ResourceId.VideoId).ToList()));

                nextPageToken = response.NextPageToken;

            } while (response.Items.Count > 0 && nextPageToken is not null);

            return (amount, totalDuration);
        }

        private static async Task<int> GetVideosAccumulatedDurationAsync(YouTubeService service, List<string> videoIds) {
            var query = service.Videos.List(new List<string> { "snippet", "contentDetails", "statistics" });
            query.Id = videoIds;
            var response = await query.ExecuteAsync();

            return (int)response.Items.Select(x => XmlConvert.ToTimeSpan(x.ContentDetails.Duration)).Sum(x => x.TotalSeconds);
        }

        private static Task<PlaylistItemListResponse> GetPlaylistPageItemsAsync(YouTubeService service, string playListId, string? nextPageToken) {
            var query = service.PlaylistItems.List("snippet");
            query.MaxResults = 50;
            query.PlaylistId = playListId;
            if (nextPageToken is not null) {
                query.PageToken = nextPageToken;
            }
            return query.ExecuteAsync();
        }
    }
}
