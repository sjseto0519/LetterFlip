using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LetterFlip.Backend.Migrations
{
    public partial class AddUrl : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PlayerIndex",
                table: "Games");

            migrationBuilder.AddColumn<string>(
                name: "PlayerUrl",
                table: "Games",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PlayerUrl",
                table: "Games");

            migrationBuilder.AddColumn<int>(
                name: "PlayerIndex",
                table: "Games",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }
    }
}
