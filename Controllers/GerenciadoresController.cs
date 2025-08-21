using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MobilizaAPI.Model;
using MobilizaAPI.Repository;
using MobilizaAPI.Helper;

namespace MobilizaAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GerenciadoresController : ControllerBase
    {
        private readonly DBMobilizaContext _dbContext;
        public GerenciadoresController(DBMobilizaContext dbContext)
        {
            _dbContext = dbContext;
        }

        [HttpPost("LoginUser")] //Login do gerenciador
        public IActionResult Login([FromBody] LoginRequest login)
        {
            try
            {
                var gerenciadores = _dbContext.gerenciadores.FirstOrDefault(u => u.email == login.Email);

                // Verifica se o usuario existe e se a senha está correta
                if (gerenciadores == null || !PasswordHasher.VerifyPassword(login.Senha, gerenciadores.senha))
                    return Unauthorized(new { message = "Email ou senha incorretos!" });

                return Ok(new
                {
                    message = "Login bem-sucedido!",
                    gerenciador = new
                    {
                        id = gerenciadores.id,
                        nome = gerenciadores.nome,
                        email = gerenciadores.email,
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erro ao realizar login.", erro = ex.Message });
            }
        }

        [HttpPost("CadastroUser")] //Cadastrar gerenciador
        public async Task<ActionResult<gerenciadores>> CriarUser([FromBody] gerenciadores User)
        {
            try
            {
                var a = await _dbContext.gerenciadores.Where(i => i.email == User.email).FirstOrDefaultAsync();
                if (a != null)
                    return BadRequest("Email já existente, crie outro.");

                User.senha = PasswordHasher.HashPassword(User.senha);
                User.status_id = 1;

                _dbContext.gerenciadores.Add(User);
                await _dbContext.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
            return Ok(User);
        }

        //[HttpGet("TodosUser")] //Trazer todos os gerenciadores
        //public async Task<ActionResult<IEnumerable<gerenciadores>>> Get()
        //{
        //    try
        //    {
        //        var gerenciadores = await _dbContext.gerenciadores.ToListAsync();
        //        return Ok(gerenciadores);
        //    }
        //    catch (Exception ex)
        //    {
        //        return BadRequest($"{ex.Message} - Detalhes: {ex.InnerException?.Message}");
        //    }
        //}

        //[HttpGet("UserEspecifico/{id}")] //Trazer gerenciador específico
        //public async Task<ActionResult<IEnumerable<gerenciadores>>> GetUser(int id)
        //{
        //    try
        //    {
        //        var gerenciadores = _dbContext.gerenciadores.Where(i => i.id == id).FirstOrDefault();
        //        return Ok(gerenciadores);
        //    }
        //    catch (Exception ex)
        //    {
        //        return BadRequest($"{ex.Message} - Detalhes: {ex.InnerException?.Message}");
        //    }
        //}

        //[HttpPut("AlterarGerenciador/{id}")] //Alterar gerenciador por id
        //public async Task<ActionResult<gerenciadores>> Atualizar(int id, [FromBody] gerenciadores gerenciadores)
        //{
        //    try
        //    {
        //        var gerenciadorAtual = await _dbContext.gerenciadores.FindAsync(id);

        //        if (gerenciadorAtual == null)
        //            return NotFound();

        //        gerenciadorAtual.nome = gerenciadores.nome;
        //        gerenciadorAtual.email = gerenciadores.email;
        //        gerenciadorAtual.senha = PasswordHasher.HashPassword(gerenciadores.senha);

        //        _dbContext.Update(gerenciadorAtual);
        //        await _dbContext.SaveChangesAsync();
        //        return Ok(gerenciadorAtual);
        //    }
        //    catch (Exception ex)
        //    {
        //        return BadRequest($"{ex.Message} - Detalhes: {ex.InnerException?.Message}");
        //    }
        //}

        //[HttpDelete("DeletarGerenciador/{id}")] // Deletar gerenciador específico
        //public async Task<ActionResult> Deletar(int id)
        //{
        //    try
        //    {
        //        var gerenciadores = await _dbContext.gerenciadores.FindAsync(id);

        //        if (gerenciadores == null)
        //            return NotFound();

        //        _dbContext.gerenciadores.Remove(gerenciadores);
        //        await _dbContext.SaveChangesAsync();

        //        return Ok("Gerenciador removido com sucesso!");
        //    }
        //    catch (Exception ex)
        //    {
        //        return BadRequest($"{ex.Message} - Detalhes: {ex.InnerException?.Message}");
        //    }
        //}

        //[HttpPut("InativarGerenciador/{id}")] //status de ativo para inativo
        //public async Task<ActionResult<gerenciadores>> Inativar(int id)
        //{
        //    try
        //    {
        //        var gerenciadores = await _dbContext.gerenciadores.FindAsync(id);
        //        gerenciadores.status_id = 2;
        //        await _dbContext.SaveChangesAsync();
        //        return Ok("Gerenciadores foi inativado com sucesso!");
        //    }
        //    catch (Exception ex)
        //    {
        //        return BadRequest($"{ex.Message} - Detalhes: {ex.InnerException?.Message}");
        //    }
        //}
    }
}
