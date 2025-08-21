using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MobilizaAPI.Model;
using MobilizaAPI.Repository;

namespace MobilizaAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CursoController : ControllerBase
    {
        private readonly DBMobilizaContext _dbContext;
        public CursoController(DBMobilizaContext dbContext)
        {
            _dbContext = dbContext;
        }

        [HttpGet("TodosCurso")] //Trazer todos os cursos
        public async Task<ActionResult<IEnumerable<curso>>> Get()
        {
            try
            {
                var curso = await _dbContext.curso.ToListAsync();
                return Ok(curso);
            }
            catch (Exception ex)
            {
                return BadRequest($"{ex.Message} - Detalhes: {ex.InnerException?.Message}");
            }
        }

        [HttpPut("InativarCurso/{id}")] //status de ativo para inativo
        public async Task<ActionResult<curso>> Inativar(int id)
        {
            try
            {
                var curso = await _dbContext.curso.FindAsync(id);
                curso.status_id = 2;
                await _dbContext.SaveChangesAsync();
                return Ok("Curso foi inativado com sucesso!");
            }
            catch (Exception ex)
            {
                return BadRequest($"{ex.Message} - Detalhes: {ex.InnerException?.Message}");
            }
        }

        [HttpPost("AdicionarCurso")] //Adicionar curso
        public async Task<ActionResult<curso>> AdicionarCurso([FromBody] curso curso)
        {
            try
            {
                _dbContext.curso.Add(curso);
                curso.status_id = 1;
                await _dbContext.SaveChangesAsync();
                return Ok(curso);
            }
            catch (Exception ex)
            {
                return BadRequest($"{ex.Message} - Detalhes: {ex.InnerException?.Message}");
            }
        }

        //[HttpGet("CursoEspecifico/{id}")] //Trazer curso específico
        //public async Task<ActionResult<IEnumerable<curso>>> GetCurso(int id)
        //{
        //    try
        //    {
        //        var curso = _dbContext.curso.Where(i => i.id == id).FirstOrDefault();
        //        return Ok(curso);
        //    }
        //    catch (Exception ex)
        //    {
        //        return BadRequest($"{ex.Message} - Detalhes: {ex.InnerException?.Message}");
        //    }
        //}


        //[HttpPut("AlterarCurso/{id}")] //Alterar curso por id
        //public async Task<ActionResult<curso>> Atualizar(int id, [FromBody] curso curso)
        //{
        //    try
        //    {
        //        var cursoAtual = await _dbContext.curso.FindAsync(id);

        //        if (cursoAtual == null)
        //            return NotFound();

        //        cursoAtual.nome = curso.nome;

        //        _dbContext.Update(cursoAtual);
        //        await _dbContext.SaveChangesAsync();
        //        return Ok(cursoAtual);
        //    }
        //    catch (Exception ex)
        //    {
        //        return BadRequest($"{ex.Message} - Detalhes: {ex.InnerException?.Message}");
        //    }
        //}

        //[HttpDelete("DeletarCurso/{id}")] // Deletar curso específico
        //public async Task<ActionResult> Deletar(int id)
        //{
        //    try
        //    {
        //        var curso = await _dbContext.curso.FindAsync(id);

        //        if (curso == null)
        //            return NotFound();

        //        _dbContext.curso.Remove(curso);
        //        await _dbContext.SaveChangesAsync();

        //        return Ok("Curso removido com sucesso!");
        //    }
        //    catch (Exception ex)
        //    {
        //        return BadRequest($"{ex.Message} - Detalhes: {ex.InnerException?.Message}");
        //    }
        //}

    }
}
