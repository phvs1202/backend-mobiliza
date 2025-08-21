using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Internal;
using MobilizaAPI.Model;
using MobilizaAPI.Repository;
using System.Diagnostics.CodeAnalysis;
using System.Runtime.CompilerServices;
using System.Security.Cryptography.X509Certificates;

namespace MobilizaAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EntradaController : ControllerBase
    {
        private readonly DBMobilizaContext _dbContext;
        public EntradaController(DBMobilizaContext dbContext)
        {
            _dbContext = dbContext;
        }

        [HttpGet("TodasEntradas")] //Trazer todos os entrada
        public async Task<ActionResult<IEnumerable<entrada>>> Get()
        {
            try
            {
                var entradas = await _dbContext.entrada.ToListAsync();
                return Ok(entradas);
            }
            catch (Exception ex)
            {
                return BadRequest($"{ex.Message} - Detalhes: {ex.InnerException?.Message}");
            }
        }


        [HttpPost("AdicionarEntrada")] //Adicionar entrada
        public async Task<ActionResult<entrada>> AdicionarEntrada([FromBody] entrada entrada)
        {
            try
            {
                _dbContext.entrada.Add(entrada);
                entrada.status_id = 1;
                await _dbContext.SaveChangesAsync();
                return Ok(entrada);
            }
            catch (Exception ex)
            {
                return BadRequest($"{ex.Message} - Detalhes: {ex.InnerException?.Message}");
            }
        }


        [HttpPut("InativarEntrada/{id}")] //status de ativo para inativo
        public async Task<ActionResult<entrada>> Inativar(int id)
        {
            try
            {
                var entrada = await _dbContext.entrada.FindAsync(id);
                entrada.status_id = 2;
                await _dbContext.SaveChangesAsync();
                return Ok("Entrada foi inativado com sucesso!");
            }
            catch (Exception ex)
            {
                return BadRequest($"{ex.Message} - Detalhes: {ex.InnerException?.Message}");
            }
        }


        [HttpGet("FiltroEntradas")]
        public async Task<ActionResult<entrada>> Entradas(DateTime? dataInicio, DateTime? dataFim)
        {
            var query = _dbContext.entrada.AsQueryable();

            if (dataInicio != null)
                query = query.Where(e => e.hora >= dataInicio.Value);

            if (dataFim != null)
                query = query.Where(e => e.hora <= dataFim.Value);

            var resultado = await query.ToListAsync();
            return Ok(resultado);
        }

        [HttpGet("EntradaPorTipo")]
        public async Task<ActionResult<entrada>> Entradas()
        {
            try
            {
                var usuarios = _dbContext.usuarios.ToList();
                var entradas = _dbContext.entrada.ToList();

                var entradasPorTipo = from entrada in entradas
                                      join usuario in usuarios on entrada.usuarios_id equals usuario.id
                                      group entrada by usuario.tipo_usuario_id into grupo
                                      select new
                                      {
                                          TipoUsuarioId = grupo.Key,
                                          QuantidadeEntradas = grupo.Count()
                                      };

                var resposta = new
                {
                    Aluno = entradasPorTipo.FirstOrDefault(i => i.TipoUsuarioId == 1)?.QuantidadeEntradas ?? 0,
                    Funcionario = entradasPorTipo.FirstOrDefault(i => i.TipoUsuarioId == 2)?.QuantidadeEntradas ?? 0,
                    Fornecedor = entradasPorTipo.FirstOrDefault(i => i.TipoUsuarioId == 3)?.QuantidadeEntradas ?? 0,
                    Visitante = entradasPorTipo.FirstOrDefault(i => i.TipoUsuarioId == 4)?.QuantidadeEntradas ?? 0,
                };

                return Ok(resposta);
            }
            catch (Exception ex)
            {
                return BadRequest($"{ex.Message} - Detalhes: {ex.InnerException?.Message}");
            }
        }
        //[HttpGet("DoisMeses")] //Procurar usuários que não entram há 2 meses
        //public async Task<ActionResult<IEnumerable<entrada>>> doisMeses()
        //{
        //    try
        //    {
        //        var entradas = await _dbContext.entrada.Select(i => new { i.usuarios_id, i.veiculo_id, i.hora }).Where(i => i.hora < DateTime.Now.AddMonths(-2)).ToListAsync();
        //        return Ok(entradas);
        //    }
        //    catch (Exception ex)
        //    {
        //        return BadRequest($"{ex.Message} - Detalhes: {ex.InnerException?.Message}");
        //    }
        //}
        //[HttpGet("EntradaEspecifica/{id}")] //Trazer entrada especifica
        //public async Task<ActionResult<IEnumerable<entrada>>> GetEntrada(int id)
        //{
        //    try
        //    {
        //        var entrada = _dbContext.entrada.Where(i => i.id == id).FirstOrDefault();
        //        return Ok(entrada);
        //    }
        //    catch (Exception ex)
        //    {
        //        return BadRequest($"{ex.Message} - Detalhes: {ex.InnerException?.Message}");
        //    }
        //}
        //[HttpPut("AlterarEntrada/{id}")] //Alterar entrada por id
        //public async Task<ActionResult<entrada>> Atualizar(int id, [FromBody] entrada entrada)
        //{
        //    try
        //    {
        //        var entradaAtual = await _dbContext.entrada.FindAsync(id);

        //        if (entrada == null)
        //            return NotFound();

        //        entradaAtual.hora = entrada.hora;
        //        entradaAtual.usuarios_id = entrada.usuarios_id;
        //        entradaAtual.motivo_entrada = entrada.motivo_entrada;
        //        entradaAtual.veiculo_id = entrada.veiculo_id;

        //        _dbContext.Update(entradaAtual);
        //        await _dbContext.SaveChangesAsync();
        //        return Ok(entradaAtual);
        //    }
        //    catch (Exception ex)
        //    {
        //        return BadRequest($"{ex.Message} - Detalhes: {ex.InnerException?.Message}");
        //    }
        //}

        //[HttpDelete("DeletarEntrada/{id}")] // Deletar entrada específica
        //public async Task<ActionResult> Deletar(int id)
        //{
        //    try
        //    {
        //        var entrada = await _dbContext.entrada.FindAsync(id);

        //        if (entrada == null)
        //            return NotFound();

        //        _dbContext.entrada.Remove(entrada);
        //        await _dbContext.SaveChangesAsync();

        //        return Ok("Entrada removida com sucesso!");
        //    }
        //    catch (Exception ex)
        //    {
        //        return BadRequest($"{ex.Message} - Detalhes: {ex.InnerException?.Message}");
        //    }
        //}
    }
}
