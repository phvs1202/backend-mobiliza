using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MobilizaAPI.Model;
using MobilizaAPI.Repository;

namespace MobilizaAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TipoVeiculoController : ControllerBase
    {
        private readonly DBMobilizaContext _dbContext;
        public TipoVeiculoController(DBMobilizaContext dbContext)
        {
            _dbContext = dbContext;
        }

        [HttpGet("TodosTipos")] //Trazer todos os tipos
        public async Task<ActionResult<IEnumerable<tipo_veiculo>>> Get()
        {
            try
            {
                var tipo = await _dbContext.tipo_veiculo.ToListAsync();
                return Ok(tipo);
            }
            catch (Exception ex)
            {
                return BadRequest($"{ex.Message} - Detalhes: {ex.InnerException?.Message}");
            }
        }

        //[HttpGet("TipoEspecifico/{id}")] //Trazer tipo específico
        //public async Task<ActionResult<IEnumerable<tipo_veiculo>>> GetTipo(int id)
        //{
        //    try
        //    {
        //        var tipo = _dbContext.tipo_veiculo.Where(i => i.id == id).FirstOrDefault();
        //        return Ok(tipo);
        //    }
        //    catch (Exception ex)
        //    {
        //        return BadRequest($"{ex.Message} - Detalhes: {ex.InnerException?.Message}");
        //    }
        //}

        //[HttpPost("AdicionarTipo")] //Adicionar tipo de veiculo
        //public async Task<ActionResult<tipo_veiculo>> AdicionarTipo([FromBody] tipo_veiculo tipo_Veiculo)
        //{
        //    try
        //    {
        //        _dbContext.tipo_veiculo.Add(tipo_Veiculo);
        //        await _dbContext.SaveChangesAsync();
        //        return Ok(tipo_Veiculo);
        //    }
        //    catch (Exception ex)
        //    {
        //        return BadRequest($"{ex.Message} - Detalhes: {ex.InnerException?.Message}");
        //    }
        //}

        //[HttpPut("AlterarTipo/{id}")] //Alterar tipo por id
        //public async Task<ActionResult<tipo_veiculo>> Atualizar(int id, [FromBody] tipo_veiculo tipo_Veiculo)
        //{
        //    try
        //    {
        //        var tipoAtual = await _dbContext.tipo_veiculo.FindAsync(id);

        //        if (tipoAtual == null)
        //            return NotFound();

        //        tipoAtual.tipo = tipo_Veiculo.tipo;

        //        _dbContext.Update(tipoAtual);
        //        await _dbContext.SaveChangesAsync();
        //        return Ok(tipoAtual);
        //    }
        //    catch (Exception ex)
        //    {
        //        return BadRequest($"{ex.Message} - Detalhes: {ex.InnerException?.Message}");
        //    }
        //}

        //[HttpDelete("DeletarTipo/{id}")] // Deletar tipo específico
        //public async Task<ActionResult> Deletar(int id)
        //{
        //    try
        //    {
        //        var tipo = await _dbContext.tipo_veiculo.FindAsync(id);

        //        if (tipo == null)
        //            return NotFound();

        //        _dbContext.tipo_veiculo.Remove(tipo);
        //        await _dbContext.SaveChangesAsync();

        //        return Ok("Tipo removido com sucesso!");
        //    }
        //    catch (Exception ex)
        //    {
        //        return BadRequest($"{ex.Message} - Detalhes: {ex.InnerException?.Message}");
        //    }
        //}
    }
}
