using CouncillorsDesk.Core.DTOs.Dashboard;

namespace CouncillorsDesk.Core.Interfaces;

public interface ITransparencyService
{
    Task<TransparencyStatsDto> GetStatsAsync(DateTime? fromDate = null, DateTime? toDate = null, CancellationToken cancellationToken = default);
}
