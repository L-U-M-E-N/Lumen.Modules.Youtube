using Google.Apis.Services;
using Google.Apis.YouTube.v3;
using Google.Apis.YouTube.v3.Data;

using System.Xml;

namespace Lumen.Modules.Youtube.Common;
public static class YoutubeApiHelper {
    private const string DELETED_VIDEO = "Deleted video";
    private const string PRIVATE_VIDEO = "Private video";
    private const int QUERY_MAX_RESULTS = 50;

    public static async Task<(int, int)> ComputeWatchlistStatusAsync(string apiKey, string playListId) {
        var service = new YouTubeService(new BaseClientService.Initializer {
            ApplicationName = "Lumen.Modules.Youtube",
            ApiKey = apiKey,
        });

        var totalDuration = 0;
        var amount = 0;
        string? nextPageToken = null;
        PlaylistItemListResponse response;
        do {
            response = await GetPlaylistPageItemsAsync(service, playListId, nextPageToken);

            var (count, duration) = await GetVideoStatsAsync(service, response.Items.Select(x => x.Snippet.ResourceId.VideoId).ToList());

            amount += count;
            totalDuration += duration;

            nextPageToken = response.NextPageToken;

        } while (response.Items.Count > 0 && nextPageToken is not null);

        return (amount, totalDuration);
    }

    private static async Task<(int, int)> GetVideoStatsAsync(YouTubeService service, List<string> videoIds) {
        var query = service.Videos.List(new List<string> { "snippet", "contentDetails", "statistics" });
        query.Id = videoIds;
        var response = await query.ExecuteAsync();

        // Show deleted/private videos in logs
        var deletedVideos = response.Items.Where(x => x.Snippet.Title == DELETED_VIDEO);
        if (deletedVideos.Any()) {
            Console.WriteLine(DELETED_VIDEO + ": " + string.Join(",", deletedVideos.Select(x => x.Id)));
        }
        var privateVideos = response.Items.Where(x => x.Snippet.Title == PRIVATE_VIDEO);
        if (privateVideos.Any()) {
            Console.WriteLine(PRIVATE_VIDEO + ": " + string.Join(",", privateVideos.Select(x => x.Id)));
        }

        // Filter out deleted/private videos
        var filteredVideos = response.Items.Where(x => x.Snippet.Title != DELETED_VIDEO && x.Snippet.Title != PRIVATE_VIDEO);

        var duration = (int)filteredVideos.Select(x => XmlConvert.ToTimeSpan(x.ContentDetails.Duration)).Sum(x => x.TotalSeconds);
        return (
            filteredVideos.Count(),
            duration
        );
    }

    private static Task<PlaylistItemListResponse> GetPlaylistPageItemsAsync(YouTubeService service, string playListId, string? nextPageToken) {
        var query = service.PlaylistItems.List("snippet");
        query.MaxResults = QUERY_MAX_RESULTS;
        query.PlaylistId = playListId;
        if (nextPageToken is not null) {
            query.PageToken = nextPageToken;
        }
        return query.ExecuteAsync();
    }
}
