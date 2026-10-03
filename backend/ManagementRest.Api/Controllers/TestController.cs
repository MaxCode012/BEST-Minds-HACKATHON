using Microsoft.AspNetCore.Mvc;
using ManagementRest.Api.DTOs;
using ManagementRest.Api.Entities;

namespace ManagementRest.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TestController : ControllerBase
{
    [HttpGet]
    public ActionResult<IEnumerable<TestDto>> GetAll()
    {
        var items = new List<TestEntity>
        {
            new TestEntity { Id = 1, Name = "Item 1", Created = DateTime.UtcNow },
            new TestEntity { Id = 2, Name = "Item 2", Created = DateTime.UtcNow }
        };

        var dtos = items.Select(e => new TestDto { Id = e.Id, Name = e.Name }).ToList();
        return Ok(dtos);
    }

    [HttpPost]
    public ActionResult<TestDto> Create([FromBody] TestDto dto)
    {
        var entity = new TestEntity { Id = 999, Name = dto.Name, Created = DateTime.UtcNow };
        var result = new TestDto { Id = entity.Id, Name = entity.Name };
        return CreatedAtAction(nameof(GetAll), new { id = result.Id }, result);
    }
}
