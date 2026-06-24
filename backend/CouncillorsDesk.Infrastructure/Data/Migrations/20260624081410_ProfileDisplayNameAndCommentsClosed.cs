using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CouncillorsDesk.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class ProfileDisplayNameAndCommentsClosed : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "CommentsClosed",
                table: "IssueReports",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "CommentNote",
                table: "AspNetUsers",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DisplayName",
                table: "AspNetUsers",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.Sql(
                """UPDATE "AspNetUsers" SET "DisplayName" = split_part("FullName", ' ', 1) WHERE "DisplayName" = '' OR "DisplayName" IS NULL;""");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CommentsClosed",
                table: "IssueReports");

            migrationBuilder.DropColumn(
                name: "CommentNote",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "DisplayName",
                table: "AspNetUsers");
        }
    }
}
