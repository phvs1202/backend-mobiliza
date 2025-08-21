using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MobilizaAPI.Model;
using MobilizaAPI.Repository;

namespace MobilizaAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StatusController : ControllerBase
    {
        private readonly DBMobilizaContext _dbContext;
        public StatusController(DBMobilizaContext dbContext)
        {
            _dbContext = dbContext;
        }

        //[HttpGet("TodosStatus")] //Trazer todos os status
        //public async Task<ActionResult<IEnumerable<status>>> Get()
        //{
        //    try
        //    {
        //        var status = await _dbContext.status.ToListAsync();
        //        return Ok(status);
        //    }
        //    catch (Exception ex)
        //    {
        //        return BadRequest($"{ex.Message} - Detalhes: {ex.InnerException?.Message}");
        //    }
        //}

        //[HttpGet("StatusEspecifico/{id}")] //Trazer status específico
        //public async Task<ActionResult<IEnumerable<status>>> GetStatus(int id)
        //{
        //    try
        //    {
        //        var status = _dbContext.status.Where(i => i.id == id).FirstOrDefault();
        //        return Ok(status);
        //    }
        //    catch (Exception ex)
        //    {
        //        return BadRequest($"{ex.Message} - Detalhes: {ex.InnerException?.Message}");
        //    }
        //}

        //[HttpPut("AlterarStatus/{id}")] //Alterar status por id
        //public async Task<ActionResult<status>> Atualizar(int id, [FromBody] status status)
        //{
        //    try
        //    {
        //        var statusAtual = await _dbContext.status.FindAsync(id);

        //        if (statusAtual == null)
        //            return NotFound();

        //        statusAtual.nome = status.nome;

        //        _dbContext.Update(statusAtual);
        //        await _dbContext.SaveChangesAsync();
        //        return Ok(statusAtual);
        //    }
        //    catch (Exception ex)
        //    {
        //        return BadRequest($"{ex.Message} - Detalhes: {ex.InnerException?.Message}");
        //    }
        //}

        //[HttpDelete("DeletarStatus/{id}")] // Deletar status específico
        //public async Task<ActionResult> Deletar(int id)
        //{
        //    try
        //    {
        //        var status = await _dbContext.status.FindAsync(id);

        //        if (status == null)
        //            return NotFound();

        //        _dbContext.status.Remove(status);
        //        await _dbContext.SaveChangesAsync();

        //        return Ok(status);
        //    }
        //    catch (Exception ex)
        //    {
        //        var detalhesErro = ex.InnerException != null ? $" - Detalhes: {ex.InnerException.Message}" : "";
        //        return BadRequest($"{ex.Message}{detalhesErro}");
        //    }
        //}
    }
}
