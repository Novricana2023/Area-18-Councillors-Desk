using CouncillorsDesk.Core.DTOs;
using CouncillorsDesk.Core.Entities;
using CouncillorsDesk.Core.Enums;
using CouncillorsDesk.Core.Interfaces;
using CouncillorsDesk.Infrastructure.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace CouncillorsDesk.Infrastructure.Services;

/// <summary>
/// Creates in-app notifications and optionally dispatches email/SMS alerts.
/// </summary>
public class NotificationService : INotificationService
{
    private readonly ApplicationDbContext _context;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IEmailService _emailService;
    private readonly ISmsService _smsService;

    public NotificationService(
        ApplicationDbContext context,
        UserManager<ApplicationUser> userManager,
        IEmailService emailService,
        ISmsService smsService)
    {
        _context = context;
        _userManager = userManager;
        _emailService = emailService;
        _smsService = smsService;
    }

    public async Task<IReadOnlyList<NotificationDto>> GetUserNotificationsAsync(
        string userId,
        bool unreadOnly = false,
        int page = 1,
        int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var query = _context.Notifications
            .AsNoTracking()
            .Where(n => n.UserId == userId);

        if (unreadOnly)
        {
            query = query.Where(n => !n.IsRead);
        }

        var notifications = await query
            .OrderByDescending(n => n.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return notifications.Select(MapToDto).ToList();
    }

    public async Task<int> GetUnreadCountAsync(string userId, CancellationToken cancellationToken = default)
        => await _context.Notifications.CountAsync(n => n.UserId == userId && !n.IsRead, cancellationToken);

    public async Task MarkAsReadAsync(Guid notificationId, string userId, CancellationToken cancellationToken = default)
    {
        var notification = await _context.Notifications
            .FirstOrDefaultAsync(n => n.Id == notificationId && n.UserId == userId, cancellationToken);

        if (notification is null)
        {
            return;
        }

        notification.IsRead = true;
        notification.ReadAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task MarkAllAsReadAsync(string userId, CancellationToken cancellationToken = default)
    {
        await _context.Notifications
            .Where(n => n.UserId == userId && !n.IsRead)
            .ExecuteUpdateAsync(
                setters => setters
                    .SetProperty(n => n.IsRead, true)
                    .SetProperty(n => n.ReadAt, DateTime.UtcNow),
                cancellationToken);
    }

    public async Task SendAsync(
        string userId,
        NotificationType type,
        string title,
        string message,
        Guid? relatedEntityId = null,
        string? actionUrl = null,
        CancellationToken cancellationToken = default)
    {
        var notification = new Notification
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Type = type,
            Title = title,
            Message = message,
            RelatedEntityId = relatedEntityId,
            ActionUrl = actionUrl,
            CreatedAt = DateTime.UtcNow
        };

        _context.Notifications.Add(notification);
        await _context.SaveChangesAsync(cancellationToken);

        var user = await _userManager.FindByIdAsync(userId);
        if (user is null)
        {
            return;
        }

        // Dispatch optional email/SMS channels based on notification type.
        if (!string.IsNullOrWhiteSpace(user.Email))
        {
            var htmlBody = $"""
                <p>{message}</p>
                {(actionUrl is not null ? $"""<p><a href="{actionUrl}">View details</a></p>""" : string.Empty)}
                """;

            await _emailService.SendAsync(user.Email, title, htmlBody, cancellationToken);
        }

        if (type is NotificationType.StatusUpdate or NotificationType.IssueAssigned
            && !string.IsNullOrWhiteSpace(user.PhoneNumber))
        {
            await _smsService.SendAsync(user.PhoneNumber, $"{title}: {message}", cancellationToken);
        }
    }

    private static NotificationDto MapToDto(Notification notification) => new()
    {
        Id = notification.Id,
        Type = notification.Type,
        Title = notification.Title,
        Message = notification.Message,
        IsRead = notification.IsRead,
        RelatedEntityId = notification.RelatedEntityId,
        ActionUrl = notification.ActionUrl,
        CreatedAt = notification.CreatedAt,
        ReadAt = notification.ReadAt
    };
}
