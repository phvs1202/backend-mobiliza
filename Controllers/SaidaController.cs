using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MobilizaAPI.Model;
using MobilizaAPI.Repository;

namespace MobilizaAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SaidaController : ControllerBase
    {
        private readonly DBMobilizaContext _dbContext;
        public SaidaController(DBMobilizaContext dbContext)
        {
            _dbContext = dbContext;
        }

        //[HttpGet("TodasSaidas")] //Trazer todos as saidas
        //public async Task<ActionResult<IEnumerable<saida>>> Get()
        //{
        //    try
        //    {
        //        var saidas = await _dbContext.saida.ToListAsync();
        //        return Ok(saidas);
        //    }
        //    catch (Exception ex)
        //    {
        //        return BadRequest($"{ex.Message} - Detalhes: {ex.InnerException?.Message}");
        //    }
        //}

        //[HttpGet("SaidaEspecifica/{id}")] //Trazer saida específica
        //public async Task<ActionResult<IEnumerable<saida>>> GetSaida(int id)
        //{
        //    try
        //    {
        //        var saida = _dbContext.saida.Where(i => i.id == id).FirstOrDefault();
        //        return Ok(saida);
        //    }
        //    catch (Exception ex)
        //    {
        //        return BadRequest($"{ex.Message} - Detalhes: {ex.InnerException?.Message}");
        //    }
        //}

        //[HttpPost("AdicionarSaida")] //Adicionar saida
        //public async Task<ActionResult<saida>> AdicionarSaida([FromBody] saida saida)
        //{
        //    try
        //    {
        //        _dbContext.saida.Add(saida);
        //        saida.status_id = 1;
        //        await _dbContext.SaveChangesAsync();
        //        return Ok(saida);
        //    }
        //    catch (Exception ex)
        //    {
        //        return BadRequest($"{ex.Message} - Detalhes: {ex.InnerException?.Message}");
        //    }
        //}

        //[HttpPut("AlterarSaida/{id}")] //Alterar saida por id
        //public async Task<ActionResult<saida>> Atualizar(int id, [FromBody] saida saida)
        //{
        //    try
        //    {
        //        var saidaAtual = await _dbContext.saida.FindAsync(id);

        //        if (saidaAtual == null)
        //            return NotFound();

        //        saidaAtual.hora = saida.hora;
        //        saidaAtual.entrada_id = saida.entrada_id;

        //        _dbContext.Update(saidaAtual);
        //        await _dbContext.SaveChangesAsync();
        //        return Ok(saidaAtual);
        //    }
        //    catch (Exception ex)
        //    {
        //        return BadRequest($"{ex.Message} - Detalhes: {ex.InnerException?.Message}");
        //    }
        //}

        //[HttpDelete("DeletarSaida/{id}")] // Deletar saida específica
        //public async Task<ActionResult> Deletar(int id)
        //{
        //    try
        //    {
        //        var saida = await _dbContext.saida.FindAsync(id);

        //        if (saida == null)
        //            return NotFound();

        //        _dbContext.saida.Remove(saida);
        //        await _dbContext.SaveChangesAsync();

        //        return Ok("Saida removida com sucesso!");
        //    }
        //    catch (Exception ex)
        //    {
        //        return BadRequest($"{ex.Message} - Detalhes: {ex.InnerException?.Message}");
        //    }
        //}

        //[HttpPut("InativarSaida/{id}")] //status de ativo para inativo
        //public async Task<ActionResult<saida>> Inativar(int id)
        //{
        //    try
        //    {
        //        var saida = await _dbContext.saida.FindAsync(id);
        //        saida.status_id = 2;
        //        await _dbContext.SaveChangesAsync();
        //        return Ok("Saída foi inativado com sucesso!");
        //    }
        //    catch (Exception ex)
        //    {
        //        return BadRequest($"{ex.Message} - Detalhes: {ex.InnerException?.Message}");
        //    }
        //}
    }
}
