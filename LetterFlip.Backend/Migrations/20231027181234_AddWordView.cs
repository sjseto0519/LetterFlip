using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LetterFlip.Backend.Migrations
{
    public partial class AddWordView : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "WordView",
                table: "Games",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "WordView",
                table: "Games");
        }
    }
}
