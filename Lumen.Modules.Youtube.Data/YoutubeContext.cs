using Lumen.Modules.Youtube.Common.Models;

using Microsoft.EntityFrameworkCore;

namespace Lumen.Modules.Youtube.Data {
    public class YoutubeContext : DbContext {
        public const string SCHEMA_NAME = "youtubewatchlist";

        public YoutubeContext(DbContextOptions options) : base(options) {
        }

        public DbSet<YoutubeWatchlistPointInTime> YoutubeWatchlist { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder) {
            modelBuilder.HasDefaultSchema(SCHEMA_NAME);

            var youtubeWatchlistModelBuilder = modelBuilder.Entity<YoutubeWatchlistPointInTime>();
            youtubeWatchlistModelBuilder.Property(x => x.Time)
                .HasColumnType("timestamp with time zone");

            youtubeWatchlistModelBuilder.Property(x => x.AmountVideos)
                .HasColumnType("integer");

            youtubeWatchlistModelBuilder.Property(x => x.SecondsDuration)
                .HasColumnType("integer");

            youtubeWatchlistModelBuilder.HasKey(x => x.Time);
        }
    }
}
