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

        [HttpGet("TodosUser")] //Trazer todos os usuários
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

        [HttpPost("LoginUser")] //Login do usuário
        public IActionResult Login([FromBody] LoginRequest login)
        {
            try
            {
                var usuario = _dbContext.usuarios.FirstOrDefault(u => u.email == login.Email);

                // Verifica se o usuario existe e se a senha está correta
                if (usuario == null || !PasswordHasher.VerifyPassword(login.Senha, usuario.senha))
                    return Unauthorized(new { message = "Email ou senha incorretos!" });

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
                        foto_de_perfil = usuario.foto_de_perfil
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erro ao realizar login.", erro = ex.Message });
            }
        }

        [HttpPost("CadastroUser")] //Cadastrar usuário
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
                _dbContext.SaveChanges();
            }
            catch (Exception ex)
            {
                return BadRequest($"{ex.Message} - Detalhes: {ex.InnerException?.Message}");
            }
            return Ok(User);
        }

        [HttpGet("qtdUser")] //Quantidade de usuarios
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

        [HttpGet("RetornarFoto/{id}")] // Retorna caminho da foto do usuário
        public async Task<ActionResult<string>> GetFoto(int id)
        {
            try
            {
                var usuario = await _dbContext.usuarios.FindAsync(id);

                if (usuario == null || string.IsNullOrEmpty(usuario.foto_de_perfil))
                    return NotFound("Usuário não encontrado ou sem foto.");

                // Caminho relativo à pasta wwwroot
                var caminhoRelativo = $"ImagensUsuarios/{usuario.foto_de_perfil}";
                return Ok(caminhoRelativo);
            }
            catch (Exception ex)
            {
                return BadRequest($"{ex.Message} - Detalhes: {ex.InnerException?.Message}");
            }
        }
        
        private string GetImagemBase64(int id)
        {
            var pastaImagens = Path.Combine(Directory.GetCurrentDirectory(), "ImagensUsuarios");
            var caminhoImagem = Path.Combine(pastaImagens, $"{id}.jpg");
            var url = caminhoImagem.Replace("\\", "/");

            Console.WriteLine("caminho da imagem: ", caminhoImagem);

            return url;
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

                //garante que a pasta existe
                var pasta = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "ImagensUsuarios");
                if (!Directory.Exists(pasta))
                    Directory.CreateDirectory(pasta);

                using var image = await Image.LoadAsync(arquivo.OpenReadStream());
                if (image.Width >= 400 || image.Height >= 400)
                    return BadRequest("A imagem deve ter menos de 400x400 pixels!");

                //nome único para o arquivo
                string extensao = Path.GetExtension(arquivo.FileName);
                if (string.IsNullOrEmpty(extensao) || extensao != ".jpg")
                    return BadRequest("Extensão do arquivo não permitida!");

                var nomeArquivo = $"{id}{extensao}";
                var caminhoCompleto = Path.Combine(pasta, nomeArquivo);

                //salva o arquivo
                using (var stream = new FileStream(caminhoCompleto, FileMode.Create))
                {
                    await arquivo.CopyToAsync(stream);
                }

                //atualiza o caminho da foto no usuário
                usuario.foto_de_perfil = nomeArquivo;
                _dbContext.Update(usuario);
                await _dbContext.SaveChangesAsync();

                return Ok(new { message = "Foto enviada com sucesso!", arquivo = nomeArquivo });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro interno: {ex.Message}");
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

        //[HttpPut("InativarUser/{id}")] //status de ativo para inativo
        //public async Task<ActionResult<usuarios>> Inativar(int id)
        //{
        //    try
        //    {
        //        var usuarios = await _dbContext.usuarios.FindAsync(id);
        //        usuarios.status_id = 2;
        //        await _dbContext.SaveChangesAsync();
        //        return Ok("Usuário foi inativado com sucesso!");
        //    }
        //    catch (Exception ex)
        //    {
        //        return BadRequest($"{ex.Message} - Detalhes: {ex.InnerException?.Message}");
        //    }
        //}
    }
}
