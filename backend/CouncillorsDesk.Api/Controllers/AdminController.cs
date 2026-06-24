using CouncillorsDesk.Core.Constants;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CouncillorsDesk.Api.Controllers;

/// <summary>
/// Super Admin endpoints — accessible only by novielungu@gmail.com.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "SuperAdminOnly")]
public class AdminController : ControllerBase
{
    [HttpGet("overview")]
    public IActionResult GetOverview()
    {
        return Ok(new
        {
            message = "Super Admin access verified.",
            email = SuperAdminPolicy.Email
        });
    }
}
