using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LetterFlip.Backend.Migrations
{
    public partial class AddOpponentWord : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "OpponentWord",
                table: "Games",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "OpponentWord",
                table: "Games");
        }
    }
}
