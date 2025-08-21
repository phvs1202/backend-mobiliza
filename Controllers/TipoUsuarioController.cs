using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MobilizaAPI.Model;
using MobilizaAPI.Repository;

namespace MobilizaAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TipoUsuarioController : ControllerBase
    {
        private readonly DBMobilizaContext _dbContext;
        public TipoUsuarioController(DBMobilizaContext dbContext)
        {
            _dbContext = dbContext;
        }

        [HttpGet("TodosTipos")] //Trazer todos os tipos
        public async Task<ActionResult<IEnumerable<tipo_usuario>>> Get()
        {
            try
            {
                var tipo = await _dbContext.tipo_usuario.ToListAsync();
                return Ok(tipo);
            }
            catch (Exception ex)
            {
                return BadRequest($"{ex.Message} - Detalhes: {ex.InnerException?.Message}");
            }
        }

        //[HttpGet("TipoEspecifico/{id}")] //Trazer tipo específico
        //public async Task<ActionResult<IEnumerable<tipo_usuario>>> GetTipo(int id)
        //{
        //    try
        //    {
        //        var tipo = _dbContext.tipo_usuario.Where(i => i.id == id).FirstOrDefault();
        //        return Ok(tipo);
        //    }
        //    catch (Exception ex)
        //    {
        //        return BadRequest($"{ex.Message} - Detalhes: {ex.InnerException?.Message}");
        //    }
        //}

        //[HttpPost("AdicionarTipo")] //Adicionar tipo de usuario
        //public async Task<ActionResult<tipo_usuario>> AdicionarTipo([FromBody] tipo_usuario tipo_Usuarios)
        //{
        //    try
        //    {
        //        _dbContext.tipo_usuario.Add(tipo_Usuarios);
        //        await _dbContext.SaveChangesAsync();
        //        return Ok(tipo_Usuarios);
        //    }
        //    catch (Exception ex)
        //    {
        //        return BadRequest($"{ex.Message} - Detalhes: {ex.InnerException?.Message}");
        //    }
        //}

        //[HttpPut("AlterarTipo/{id}")] //Alterar tipo por id
        //public async Task<ActionResult<tipo_usuario>> Atualizar(int id, [FromBody] tipo_usuario tipo_Usuario)
        //{
        //    try
        //    {
        //        var tipoAtual = await _dbContext.tipo_usuario.FindAsync(id);

        //        if (tipoAtual == null)
        //            return NotFound();

        //        tipoAtual.tipo = tipo_Usuario.tipo;

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
        //        var tipo = await _dbContext.tipo_usuario.FindAsync(id);

        //        if (tipo == null)
        //            return NotFound();

        //        _dbContext.tipo_usuario.Remove(tipo);
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
