using CouncillorsDesk.Core.DTOs;
using CouncillorsDesk.Core.Enums;

namespace CouncillorsDesk.Core.Interfaces;

public interface INotificationService
{
    Task<IReadOnlyList<NotificationDto>> GetUserNotificationsAsync(string userId, bool unreadOnly = false, int page = 1, int pageSize = 20, CancellationToken cancellationToken = default);
    Task<int> GetUnreadCountAsync(string userId, CancellationToken cancellationToken = default);
    Task MarkAsReadAsync(Guid notificationId, string userId, CancellationToken cancellationToken = default);
    Task MarkAllAsReadAsync(string userId, CancellationToken cancellationToken = default);
    Task SendAsync(string userId, NotificationType type, string title, string message, Guid? relatedEntityId = null, string? actionUrl = null, CancellationToken cancellationToken = default);
}
