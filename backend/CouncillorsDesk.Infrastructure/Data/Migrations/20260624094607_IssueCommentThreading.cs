using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CouncillorsDesk.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class IssueCommentThreading : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "ParentCommentId",
                table: "IssueComments",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_IssueComments_ParentCommentId",
                table: "IssueComments",
                column: "ParentCommentId");

            migrationBuilder.AddForeignKey(
                name: "FK_IssueComments_IssueComments_ParentCommentId",
                table: "IssueComments",
                column: "ParentCommentId",
                principalTable: "IssueComments",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_IssueComments_IssueComments_ParentCommentId",
                table: "IssueComments");

            migrationBuilder.DropIndex(
                name: "IX_IssueComments_ParentCommentId",
                table: "IssueComments");

            migrationBuilder.DropColumn(
                name: "ParentCommentId",
                table: "IssueComments");
        }
    }
}
