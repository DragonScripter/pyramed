using Microsoft.AspNetCore.Mvc;
using PyraMed.Api.Models;
using backend.Services;

namespace backend.Controllers;

[ApiController]
[Route("api/clinicalrules")]
public sealed class ClinicalRulesController : ControllerBase
{
    private readonly IClinicalRuleStore _store;

    public ClinicalRulesController(IClinicalRuleStore store) => _store = store;

    [HttpPost]
    public ActionResult<ClinicalRule> Create([FromBody] ClinicalRule rule)
    {
        if (!VitalAccessor.IsKnown(rule.VitalName))
        {
            ModelState.AddModelError(
                nameof(rule.VitalName),
                $"Unknown vital '{rule.VitalName}'. Allowed: {string.Join(", ", VitalAccessor.Names)}");
            return ValidationProblem(ModelState);
        }

        var created = _store.Add(rule);
        return CreatedAtAction(nameof(GetAll), new { id = created.Id }, created);
    }

    [HttpGet]
    public ActionResult<IEnumerable<ClinicalRule>> GetAll() => Ok(_store.GetAll());
}