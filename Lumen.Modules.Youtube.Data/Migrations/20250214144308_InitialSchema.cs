using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Lumen.Modules.Youtube.Data.Migrations
{
    /// <inheritdoc />
    public partial class InitialSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "youtubewatchlist");

            migrationBuilder.CreateTable(
                name: "YoutubeWatchlist",
                schema: "youtubewatchlist",
                columns: table => new
                {
                    Time = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    SecondsDuration = table.Column<int>(type: "integer", nullable: false),
                    AmountVideos = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_YoutubeWatchlist", x => x.Time);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "YoutubeWatchlist",
                schema: "youtubewatchlist");
        }
    }
}
