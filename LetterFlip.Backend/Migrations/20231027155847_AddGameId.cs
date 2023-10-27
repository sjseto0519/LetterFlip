using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LetterFlip.Backend.Migrations
{
    public partial class AddGameId : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "GameId",
                table: "Games",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "PlayerIndex",
                table: "Games",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "GameId",
                table: "Games");

            migrationBuilder.DropColumn(
                name: "PlayerIndex",
                table: "Games");
        }
    }
}
