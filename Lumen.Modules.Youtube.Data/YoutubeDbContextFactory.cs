using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Lumen.Modules.Youtube.Data {
    public class YoutubeDbContextFactory : IDesignTimeDbContextFactory<YoutubeContext> {
        public YoutubeContext CreateDbContext(string[] args) {
            var optionsBuilder = new DbContextOptionsBuilder<YoutubeContext>();
            optionsBuilder.UseNpgsql();

            return new YoutubeContext(optionsBuilder.Options);
        }
    }
}
