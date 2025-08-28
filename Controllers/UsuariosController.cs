using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MobilizaAPI.Model;
using MobilizaAPI.Repository;
using Org.BouncyCastle.Crypto;
using MobilizaAPI.Helper;
using System.Security.Policy;
using Microsoft.EntityFrameworkCore.Metadata.Conventions;
using QRCoder;
using System.Drawing.Imaging;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Processing;
using SixLabors.ImageSharp.Formats;
using System.Text;

namespace MobilizaAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsuariosController : ControllerBase
    {
        private readonly DBMobilizaContext _dbContext;
        public UsuariosController(DBMobilizaContext dbContext)
        {
            _dbContext = dbContext;
        }

        [HttpGet("TodosUser")]
        public async Task<ActionResult<IEnumerable<usuarios>>> Get()
        {
            try
            {
                var usuarios = await _dbContext.usuarios.ToListAsync();
                return Ok(usuarios);
            }
            catch (Exception ex)
            {
                return BadRequest($"{ex.Message} - Detalhes: {ex.InnerException?.Message}");
            }
        }

        [HttpPost("LoginUser")]
        public IActionResult Login([FromBody] LoginRequest login)
        {
            try
            {
                var usuario = _dbContext.usuarios.FirstOrDefault(u => u.email == login.Email);

                if (usuario == null || !PasswordHasher.VerifyPassword(login.Senha, usuario.senha))
                    return Unauthorized(new { message = "Email ou senha incorretos!" });

                string fotoBase64 = usuario.foto_de_perfil != null ? Convert.ToBase64String(usuario.foto_de_perfil) : null;

                return Ok(new
                {
                    message = "Login bem-sucedido!",
                    cliente = new
                    {
                        id = usuario.id,
                        nome = usuario.nome,
                        email = usuario.email,
                        tipo_usuario = usuario.tipo_usuario_id,
                        curso_id = usuario.curso_id,
                        foto_de_perfil = fotoBase64 != null ? $"data:image/jpeg;base64,{fotoBase64}" : null
                        status_id = usuario.status_id
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erro ao realizar login.", erro = ex.Message });
            }
        }

        [HttpPost("CadastroUser")]
        public async Task<ActionResult<usuarios>> CriarUser([FromBody] usuarios User)
        {
            try
            {
                var a = await _dbContext.usuarios.Where(i => i.email == User.email).FirstOrDefaultAsync();
                if (a != null)
                    return BadRequest("Email já existente, crie outro.");

                User.senha = PasswordHasher.HashPassword(User.senha);
                User.status_id = 1;

                _dbContext.usuarios.Add(User);
                await _dbContext.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                return BadRequest($"{ex.Message} - Detalhes: {ex.InnerException?.Message}");
            }
            return Ok(User);
        }

        [HttpGet("qtdUser")]
        public async Task<ActionResult<IEnumerable<usuarios>>> quantidade()
        {
            try
            {
                var usuarios = await _dbContext.usuarios
                    .GroupBy(i => i.tipo_usuario_id)
                    .Select(g => new
                    {
                        Tipo = g.Key,
                        Quantidade = g.Count()
                    }).ToListAsync();

                var quantidades = new
                {
                    Aluno = usuarios.FirstOrDefault(i => i.Tipo == 1)?.Quantidade ?? 0,
                    Funcionario = usuarios.FirstOrDefault(i => i.Tipo == 2)?.Quantidade ?? 0,
                    Fornecedor = usuarios.FirstOrDefault(i => i.Tipo == 3)?.Quantidade ?? 0,
                    Visitante = usuarios.FirstOrDefault(i => i.Tipo == 4)?.Quantidade ?? 0,
                };
                return Ok(quantidades);
            }
            catch (Exception ex)
            {
                return BadRequest($"{ex.Message} - Detalhes: {ex.InnerException?.Message}");
            }
        }

        [HttpPost("UploadFoto/{id}")]
        public async Task<IActionResult> UploadFoto(int id, IFormFile arquivo)
        {
            try
            {
                var usuario = await _dbContext.usuarios.FindAsync(id);
                if (usuario == null)
                    return NotFound("Usuário não encontrado.");

                if (arquivo == null || arquivo.Length == 0)
                    return BadRequest("Arquivo inválido.");

                using var image = await Image.LoadAsync(arquivo.OpenReadStream());
                if (image.Width > 400 || image.Height > 400)
                    return BadRequest("A imagem deve ter menos de 400x400 pixels!");

                // Converte a imagem em bytes para salvar no banco
                using var ms = new MemoryStream();
                await arquivo.CopyToAsync(ms);
                usuario.foto_de_perfil = ms.ToArray();

                _dbContext.Update(usuario);
                await _dbContext.SaveChangesAsync();

                string fotoBase64 = Convert.ToBase64String(usuario.foto_de_perfil);

                return Ok(new
                {
                    message = "Foto enviada com sucesso!",
                    arquivo = $"data:image/jpeg;base64,{fotoBase64}"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro interno: {ex.Message}");
            }
        }

        [HttpGet("RetornarFoto/{id}")]
        public async Task<ActionResult<string>> GetFoto(int id)
        {
            try
            {
                var usuario = await _dbContext.usuarios.FindAsync(id);
                if (usuario == null || usuario.foto_de_perfil == null)
                    return NotFound("Usuário não encontrado ou sem foto.");

                string fotoBase64 = Convert.ToBase64String(usuario.foto_de_perfil);
                return Ok($"data:image/jpeg;base64,{fotoBase64}");
            }
            catch (Exception ex)
            {
                return BadRequest($"{ex.Message} - Detalhes: {ex.InnerException?.Message}");
            }
        }

        
        //[HttpGet("UserEspecifico/{id}")] //Trazer usuário específico
        //public async Task<ActionResult<IEnumerable<usuarios>>> GetUser(int id)
        //{
        //    try
        //    {
        //        var usuarios = _dbContext.usuarios.Where(i => i.id == id).FirstOrDefault();
        //        return Ok(usuarios);
        //    }
        //    catch (Exception ex)
        //    {
        //        return BadRequest($"{ex.Message} - Detalhes: {ex.InnerException?.Message}");
        //    }
        //}

        //[HttpPut("AlterarUsuario/{id}")] //Alterar usuario por id
        //public async Task<ActionResult<usuarios>> Atualizar(int id, [FromBody] usuarios usuarios)
        //{
        //    try
        //    {
        //        var usuarioAtual = await _dbContext.usuarios.FindAsync(id);

        //        if (usuarioAtual == null)
        //            return NotFound();

        //        usuarioAtual.nome = usuarios.nome;
        //        usuarioAtual.email = usuarios.email;
        //        usuarioAtual.senha = PasswordHasher.HashPassword(usuarios.senha);
        //        usuarioAtual.tipo_usuario_id = usuarios.tipo_usuario_id;
        //        usuarioAtual.curso_id = usuarios.curso_id;

        //        _dbContext.Update(usuarioAtual);
        //        await _dbContext.SaveChangesAsync();
        //        return Ok(usuarioAtual);
        //    }
        //    catch (Exception ex)
        //    {
        //        return BadRequest($"{ex.Message} - Detalhes: {ex.InnerException?.Message}");
        //    }
        //}

        //[HttpDelete("DeletarUsuario/{id}")] // Deletar Usuário específico
        //public async Task<ActionResult> Deletar(int id)
        //{
        //    try
        //    {
        //        var usuario = await _dbContext.usuarios.FindAsync(id);

        //        if (usuario == null)
        //            return NotFound();

        //        var entradas = await _dbContext.entrada.Where(i => i.usuarios_id == usuario.id).ToListAsync();
        //        var veiculos = await _dbContext.veiculos.Where(i => i.usuario_id == usuario.id).ToListAsync();

        //        _dbContext.entrada.RemoveRange(entradas);
        //        await _dbContext.SaveChangesAsync();

        //        _dbContext.veiculos.RemoveRange(veiculos);
        //        await _dbContext.SaveChangesAsync();

        //        _dbContext.usuarios.Remove(usuario);
        //        await _dbContext.SaveChangesAsync();

        //        return Ok("O usuário e seus dados foram removidos com sucesso!");
        //    }
        //    catch (Exception ex)
        //    {
        //        var detalhesErro = ex.InnerException != null ? $" - Detalhes: {ex.InnerException.Message}" : "";
        //        return BadRequest($"{ex.Message}{detalhesErro}");
        //    }
        //}

        [HttpPut("InativarUser/{id}")] //status de ativo para inativo
        public async Task<ActionResult<usuarios>> Inativar(int id)
        {
            try
            {
                var usuarios = await _dbContext.usuarios.FindAsync(id);
                usuarios.status_id = 2;
                await _dbContext.SaveChangesAsync();
                return Ok("Usuário foi inativado com sucesso!");
            }
            catch (Exception ex)
            {
                return BadRequest($"{ex.Message} - Detalhes: {ex.InnerException?.Message}");
            }
        }

        [HttpPut("AtivarUser/{id}")] //status de inativo para ativo
        public async Task<ActionResult<usuarios>> Ativar(int id)
        {
            try
            {
                var usuarios = await _dbContext.usuarios.FindAsync(id);
                usuarios.status_id = 1;
                await _dbContext.SaveChangesAsync();
                return Ok("Usuário foi ativado com sucesso!");
            }
            catch (Exception ex)
            {
                return BadRequest($"{ex.Message} - Detalhes: {ex.InnerException?.Message}");
            }
        }
    }
}
